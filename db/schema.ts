/**
 * Database schema for the Prof. Adeyanju CMS.
 *
 * Every content table mirrors one section that already exists on the public
 * site, so the media team edits the same shapes the pages were designed for.
 * They all share `position` (manual ordering) and `published` (staging), which
 * is what lets a single generic admin screen drive all of them.
 */
import { relations, sql } from "drizzle-orm";
import {
  boolean,
  customType,
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/* Uploaded files live in Postgres itself. That keeps the CMS portable: the
   same code runs against Neon on Vercel (read-only filesystem, no blob store
   to configure) and against the Docker container on a self-hosted box. */
const bytea = customType<{ data: Buffer; default: false }>({
  dataType: () => "bytea",
});

export const userRole = pgEnum("user_role", ["admin", "editor"]);

/* ------------------------------------------------------------------ auth */

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: userRole("role").notNull().default("editor"),
  /* Deactivating beats deleting — it preserves the "uploaded by" trail. */
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

/* Server-side sessions rather than a self-contained JWT, so that revoking
   access (someone leaves the media team) takes effect on the next request
   instead of whenever the token happens to expire. */
export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* ----------------------------------------------------------------- media */

export const media = pgTable("media", {
  id: uuid("id").primaryKey().defaultRandom(),
  filename: text("filename").notNull(),
  mimeType: text("mime_type").notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width"),
  height: integer("height"),
  /* Always required on upload — the public pages are image-heavy and every
     <Image> on them needs a real alt. */
  alt: text("alt").notNull().default(""),
  /* sha-256 of the bytes, used as the cache-busting key in the media URL. */
  checksum: text("checksum").notNull(),
  data: bytea("data").notNull(),
  uploadedById: uuid("uploaded_by_id").references(() => users.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

/* --------------------------------------------------------------- content */

/** Columns every content row carries. Spread into each table below. */
const contentColumns = {
  id: uuid("id").primaryKey().defaultRandom(),
  position: integer("position").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

/**
 * Columns that turn a row into an article with its own page on the site: an
 * address, the full story, more photos, and an optional PDF (a citation, a
 * certificate, a press release).
 *
 * `slug` is set once, from the title, when the entry is created and is not
 * changed afterwards, so shared links keep working when a title is edited.
 * `body` is HTML from the CMS editor, sanitised on save and again on render
 * (lib/cms/rich-text.ts). The gallery is an ordered list of media ids rather
 * than a join table: order matters, it is only ever read whole, and ids whose
 * image has since been deleted are simply skipped.
 *
 * A function rather than a shared object: each table needs its own column
 * builders, or the unique constraint on `slug` gets one name for all three.
 */
const articleColumns = () => ({
  slug: text("slug").notNull().unique(),
  body: text("body"),
  galleryIds: uuid("gallery_ids").array().notNull().default(sql`'{}'::uuid[]`),
  attachmentId: uuid("attachment_id").references(() => media.id, {
    onDelete: "set null",
  }),
});

/** Who an award was given to. Drives the label and filter on the site. */
export const AWARD_RECIPIENTS = ["personal", "gbb"] as const;
export type AwardRecipient = (typeof AWARD_RECIPIENTS)[number];

/**
 * What a news item is about. Plain words, because the media team picks one
 * every time they post: an award, an invitation or lecture, coverage in the
 * press, or anything else worth announcing.
 */
export const NEWS_CATEGORIES = ["award", "invitation", "press", "announcement"] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

/**
 * News & Awards — the one place the media team announces things: an award,
 * an invitation to give a lecture, a selection, coverage in the press.
 * Each item is an article with a cover photo, a summary for the cards, the
 * full story, a gallery and an optional PDF.
 *
 * Replaces the separate `awards` and `press_items` tables, which migration
 * 0003 copied in. Those tables are left in place for one deploy so the
 * previous version of the site keeps working while the new one builds.
 */
export const newsItems = pgTable("news_items", {
  ...contentColumns,
  ...articleColumns(),
  title: text("title").notNull(),
  category: text("category", { enum: NEWS_CATEGORIES }).notNull().default("announcement"),
  /* When it happened — presented, delivered, published. */
  happenedOn: date("happened_on"),
  /* Only for items carried over from awards that recorded a year and no date;
     shown when there is no date. The form does not edit it. */
  year: text("year"),
  /* The short summary shown on the cards. */
  summary: text("summary"),
  /* Who presented the award, hosts the lecture or published the article. */
  source: text("source"),
  /* The original article, or the event's page. */
  href: text("href"),
  /* Awards only: who it was given to. */
  recipient: text("recipient", { enum: AWARD_RECIPIENTS }),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
  /* Shown in "Latest" under the home page's hero. */
  featured: boolean("featured").notNull().default(true),
});

/** The animated counters in the dark band on the home page. */
export const stats = pgTable("stats", {
  ...contentColumns,
  value: integer("value").notNull(),
  suffix: text("suffix").notNull().default(""),
  label: text("label").notNull(),
  description: text("description"),
});

/**
 * The fixed image slots in the page designs — the hero portrait, the team
 * photo and so on.
 *
 * Unlike the other content tables these rows are not created or deleted by the
 * team: the design has exactly these places, and each row just records which
 * uploaded image currently fills one. `slot` is the stable key the pages look
 * themselves up by.
 */
export const siteImages = pgTable("site_images", {
  ...contentColumns,
  slot: text("slot").notNull().unique(),
  label: text("label").notNull(),
  caption: text("caption"),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/** The four counters across the top of the Impact page. */
export const impactStats = pgTable("impact_stats", {
  ...contentColumns,
  value: integer("value").notNull(),
  suffix: text("suffix").notNull().default(""),
  label: text("label").notNull(),
  description: text("description"),
});

/** The scrolling keyword strip under the hero. */
export const marqueeItems = pgTable("marquee_items", {
  ...contentColumns,
  text: text("text").notNull(),
  description: text("description"),
});

/** Career chapters on /journey. */
export const timelineEntries = pgTable("timeline_entries", {
  ...contentColumns,
  period: text("period").notNull(),
  title: text("title").notNull(),
  org: text("org").notNull(),
  detail: text("detail").notNull(),
});

/** Flagship programmes on /impact and the home page. */
export const initiatives = pgTable("initiatives", {
  ...contentColumns,
  ...articleColumns(),
  title: text("title").notNull(),
  detail: text("detail").notNull(),
  /* Name of a Lucide icon, resolved through the allow-list in
     app/lib/icons.ts — we never put a component reference in the database. */
  icon: text("icon").notNull().default("Sparkles"),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/** Research areas on /research and the home page. */
export const researchAreas = pgTable("research_areas", {
  ...contentColumns,
  area: text("area").notNull(),
  detail: text("detail").notNull(),
});

/** Degrees and posts on /about. */
export const educationEntries = pgTable("education_entries", {
  ...contentColumns,
  years: text("years").notNull(),
  degree: text("degree").notNull(),
  school: text("school").notNull(),
  href: text("href"),
  description: text("description"),
});

/** Personal honours on /recognition. */
export const honours = pgTable("honours", {
  ...contentColumns,
  text: text("text").notNull(),
  description: text("description"),
});

/**
 * Awards — to Prof. Adeyanju personally or to Galaxy Backbone under his
 * leadership. This is the table the media team uses most: each award is an
 * article with a cover photo, a short summary for the cards, the full story,
 * a gallery and an optional PDF.
 */
export const awards = pgTable("awards", {
  ...contentColumns,
  ...articleColumns(),
  award: text("award").notNull(),
  year: text("year").notNull(),
  recipient: text("recipient", { enum: AWARD_RECIPIENTS }).notNull().default("gbb"),
  awardedBy: text("awarded_by"),
  awardedOn: date("awarded_on"),
  /* The short summary shown on the cards. */
  detail: text("detail"),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/**
 * Press coverage on /recognition and the home page. Each item has its own
 * page; the link to the original is optional so print-only coverage can be
 * shared as a scanned PDF instead.
 */
export const pressItems = pgTable("press_items", {
  ...contentColumns,
  ...articleColumns(),
  outlet: text("outlet").notNull(),
  title: text("title").notNull(),
  href: text("href"),
  publishedOn: date("published_on"),
  description: text("description"),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/** The "At a glance" key/value card on /about. */
export const glanceItems = pgTable("glance_items", {
  ...contentColumns,
  label: text("label").notNull(),
  value: text("value").notNull(),
  description: text("description"),
});

/* --------------------------------------------------------------- relations */

export const mediaRelations = relations(media, ({ one }) => ({
  uploadedBy: one(users, {
    fields: [media.uploadedById],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const initiativeRelations = relations(initiatives, ({ one }) => ({
  image: one(media, {
    fields: [initiatives.imageId],
    references: [media.id],
    relationName: "initiative_image",
  }),
  attachment: one(media, {
    fields: [initiatives.attachmentId],
    references: [media.id],
    relationName: "initiative_attachment",
  }),
}));

export const awardRelations = relations(awards, ({ one }) => ({
  image: one(media, {
    fields: [awards.imageId],
    references: [media.id],
    relationName: "award_image",
  }),
  attachment: one(media, {
    fields: [awards.attachmentId],
    references: [media.id],
    relationName: "award_attachment",
  }),
}));

export const siteImageRelations = relations(siteImages, ({ one }) => ({
  image: one(media, { fields: [siteImages.imageId], references: [media.id] }),
}));

export const newsRelations = relations(newsItems, ({ one }) => ({
  image: one(media, {
    fields: [newsItems.imageId],
    references: [media.id],
    relationName: "news_image",
  }),
  attachment: one(media, {
    fields: [newsItems.attachmentId],
    references: [media.id],
    relationName: "news_attachment",
  }),
}));

export const pressRelations = relations(pressItems, ({ one }) => ({
  image: one(media, {
    fields: [pressItems.imageId],
    references: [media.id],
    relationName: "press_image",
  }),
  attachment: one(media, {
    fields: [pressItems.attachmentId],
    references: [media.id],
    relationName: "press_attachment",
  }),
}));

export type User = typeof users.$inferSelect;
export type Media = typeof media.$inferSelect;
