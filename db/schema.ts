/**
 * Database schema for the Prof. Adeyanju CMS.
 *
 * Every content table mirrors one section that already exists on the public
 * site, so the media team edits the same shapes the pages were designed for.
 * They all share `position` (manual ordering) and `published` (staging), which
 * is what lets a single generic admin screen drive all of them.
 */
import { relations } from "drizzle-orm";
import {
  boolean,
  customType,
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

/** The animated counters in the dark band on the home page. */
export const stats = pgTable("stats", {
  ...contentColumns,
  value: integer("value").notNull(),
  suffix: text("suffix").notNull().default(""),
  label: text("label").notNull(),
});

/** The four counters across the top of the Impact page. */
export const impactStats = pgTable("impact_stats", {
  ...contentColumns,
  value: integer("value").notNull(),
  suffix: text("suffix").notNull().default(""),
  label: text("label").notNull(),
});

/** The scrolling keyword strip under the hero. */
export const marqueeItems = pgTable("marquee_items", {
  ...contentColumns,
  text: text("text").notNull(),
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
});

/** Personal honours on /recognition. */
export const honours = pgTable("honours", {
  ...contentColumns,
  text: text("text").notNull(),
});

/**
 * Awards won by Galaxy Backbone. This is the "achievements" table the media
 * team will use most, so it takes an image (the award photo or certificate)
 * and a longer optional description.
 */
export const awards = pgTable("awards", {
  ...contentColumns,
  award: text("award").notNull(),
  year: text("year").notNull(),
  detail: text("detail"),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/** Press coverage on /recognition and the home page. */
export const pressItems = pgTable("press_items", {
  ...contentColumns,
  outlet: text("outlet").notNull(),
  title: text("title").notNull(),
  href: text("href").notNull(),
  imageId: uuid("image_id").references(() => media.id, { onDelete: "set null" }),
});

/** The "At a glance" key/value card on /about. */
export const glanceItems = pgTable("glance_items", {
  ...contentColumns,
  label: text("label").notNull(),
  value: text("value").notNull(),
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
  image: one(media, { fields: [initiatives.imageId], references: [media.id] }),
}));

export const awardRelations = relations(awards, ({ one }) => ({
  image: one(media, { fields: [awards.imageId], references: [media.id] }),
}));

export const pressRelations = relations(pressItems, ({ one }) => ({
  image: one(media, { fields: [pressItems.imageId], references: [media.id] }),
}));

export type User = typeof users.$inferSelect;
export type Media = typeof media.$inferSelect;
