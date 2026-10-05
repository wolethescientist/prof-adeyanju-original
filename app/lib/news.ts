import "server-only";

import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { newsItems, type AwardRecipient, type NewsCategory } from "@/db/schema";
import { formatDate } from "./format";
import {
  attachment,
  coverColumns,
  gallery,
  picture,
  story,
  type Attachment,
  type Picture,
} from "./articles";

/**
 * Read side of News & Awards: the cards that list the items, the strip of
 * the latest ones on the home page, and the page each item opens.
 *
 * Only published items are returned. The pages are statically rendered and
 * refreshed when the CMS saves, so none of this runs per visit.
 */

export const NEWS_PATH = "/news";

/** How long an item carries the "New" tag after it was posted. */
const NEW_FOR_DAYS = 14;

export type NewsCard = {
  id: string;
  slug: string;
  href: string;
  title: string;
  category: NewsCategory;
  /** "14 March 2025", or just the year for older awards that recorded no date. */
  when: string | null;
  source: string | null;
  summary: string | null;
  cover: Picture | null;
  /** Posted within the last two weeks. */
  isNew: boolean;
};

export type NewsArticle = NewsCard & {
  recipient: AwardRecipient | null;
  /** The original article, or the event's page. */
  link: string | null;
  body: string | null;
  gallery: Picture[];
  attachment: Attachment | null;
  postedAt: Date;
  updatedAt: Date;
};

type Row = typeof newsItems.$inferSelect & {
  image: Parameters<typeof picture>[0];
};

function card(row: Row): NewsCard {
  const posted = Date.now() - row.createdAt.getTime();
  return {
    id: row.id,
    slug: row.slug,
    href: `${NEWS_PATH}/${row.slug}`,
    title: row.title,
    category: row.category,
    when: formatDate(row.happenedOn) ?? row.year,
    source: row.source,
    summary: row.summary,
    cover: picture(row.image, row.title),
    isNew: posted < NEW_FOR_DAYS * 24 * 60 * 60 * 1000,
  };
}

/** Every published item, in the order the team set — new posts lead. */
export async function getNewsCards(): Promise<NewsCard[]> {
  const rows = await db.query.newsItems.findMany({
    where: eq(newsItems.published, true),
    orderBy: asc(newsItems.position),
    with: { image: coverColumns },
  });
  return rows.map(card);
}

/** The newest items marked for the home page, most recently posted first. */
export async function getLatestNews(limit = 3): Promise<NewsCard[]> {
  const rows = await db.query.newsItems.findMany({
    where: and(eq(newsItems.published, true), eq(newsItems.featured, true)),
    orderBy: [desc(newsItems.createdAt), asc(newsItems.position)],
    limit,
    with: { image: coverColumns },
  });
  return rows.map(card);
}

export async function getNewsItem(slug: string): Promise<NewsArticle | null> {
  const row = await db.query.newsItems.findFirst({
    where: and(eq(newsItems.slug, slug), eq(newsItems.published, true)),
    with: { image: coverColumns },
  });
  if (!row) return null;
  return {
    ...card(row),
    recipient: row.recipient,
    link: row.href,
    body: story(row.body),
    gallery: await gallery(row.galleryIds, row.title),
    attachment: await attachment(row.attachmentId),
    postedAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
