import "server-only";

import { and, asc, eq, inArray, like } from "drizzle-orm";
import { db } from "@/db";
import { initiatives, media } from "@/db/schema";
import { mediaUrl } from "@/lib/cms/media-url";
import { cleanRichText, hasText, plainText } from "@/lib/cms/rich-text";

/**
 * Read side of the article sections, for the public pages: the cards that
 * list them and the page each one opens. Initiatives are here; news (awards,
 * invitations, press) is in ./news.ts and shares the helpers below.
 *
 * Only published entries are ever returned, in the order the team set. The
 * pages are statically rendered and refreshed when the CMS saves, so none of
 * this runs per visit.
 */

export type Picture = {
  id: string;
  src: string;
  alt: string;
  width: number | null;
  height: number | null;
};

export type Attachment = {
  src: string;
  filename: string;
  byteSize: number;
};

export type Cover = { id: string; checksum: string; alt: string; width: number | null; height: number | null } | null;

export const coverColumns = {
  columns: { id: true, checksum: true, alt: true, width: true, height: true },
} as const;

export function picture(image: Cover, fallbackAlt: string): Picture | null {
  if (!image) return null;
  return {
    id: image.id,
    src: mediaUrl(image)!,
    alt: image.alt || fallbackAlt,
    width: image.width,
    height: image.height,
  };
}

/** Gallery ids → pictures, in the editor's order, skipping deleted ones. */
export async function gallery(ids: string[], fallbackAlt: string): Promise<Picture[]> {
  if (ids.length === 0) return [];
  const rows = await db
    .select({
      id: media.id,
      checksum: media.checksum,
      alt: media.alt,
      width: media.width,
      height: media.height,
    })
    .from(media)
    .where(and(inArray(media.id, ids), like(media.mimeType, "image/%")));
  const byId = new Map(rows.map((row) => [row.id, row]));
  return ids
    .map((id) => picture(byId.get(id) ?? null, fallbackAlt))
    .filter((item): item is Picture => item !== null);
}

export async function attachment(id: string | null): Promise<Attachment | null> {
  if (!id) return null;
  const [row] = await db
    .select({
      id: media.id,
      checksum: media.checksum,
      filename: media.filename,
      byteSize: media.byteSize,
    })
    .from(media)
    .where(eq(media.id, id))
    .limit(1);
  return row ? { src: mediaUrl(row)!, filename: row.filename, byteSize: row.byteSize } : null;
}

/** The story as safe HTML, or null when nothing has been written yet. */
export function story(body: string | null) {
  const html = cleanRichText(body);
  return hasText(html) ? html : null;
}

/** A description for search engines and link previews. */
export function describe(summary: string | null, body: string | null, max = 180) {
  const text = summary?.trim() || plainText(body);
  return text.length > max ? `${text.slice(0, max - 1).replace(/\s+\S*$/, "")}…` : text;
}

/* ------------------------------------------------------------- initiatives */

export const INITIATIVE_PATH = "/impact/initiatives";

export type InitiativeCard = {
  id: string;
  slug: string;
  href: string;
  title: string;
  summary: string;
  icon: string;
  cover: Picture | null;
};

export type InitiativeArticle = InitiativeCard & {
  body: string | null;
  gallery: Picture[];
  attachment: Attachment | null;
  updatedAt: Date;
};

export async function getInitiativeCards(): Promise<InitiativeCard[]> {
  const rows = await db.query.initiatives.findMany({
    where: eq(initiatives.published, true),
    orderBy: asc(initiatives.position),
    with: { image: coverColumns },
  });
  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    href: `${INITIATIVE_PATH}/${row.slug}`,
    title: row.title,
    summary: row.detail,
    icon: row.icon,
    cover: picture(row.image, row.title),
  }));
}

export async function getInitiative(slug: string): Promise<InitiativeArticle | null> {
  const row = await db.query.initiatives.findFirst({
    where: and(eq(initiatives.slug, slug), eq(initiatives.published, true)),
    with: { image: coverColumns },
  });
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    href: `${INITIATIVE_PATH}/${row.slug}`,
    title: row.title,
    summary: row.detail,
    icon: row.icon,
    cover: picture(row.image, row.title),
    body: story(row.body),
    gallery: await gallery(row.galleryIds, row.title),
    attachment: await attachment(row.attachmentId),
    updatedAt: row.updatedAt,
  };
}
