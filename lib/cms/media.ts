import "server-only";

import { desc, like, not } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

export type { MediaItem } from "./media-types";

/** The columns describing a library file — everything except its bytes. */
export const LIBRARY_COLUMNS = {
  id: media.id,
  filename: media.filename,
  mimeType: media.mimeType,
  alt: media.alt,
  checksum: media.checksum,
  width: media.width,
  height: media.height,
  byteSize: media.byteSize,
  createdAt: media.createdAt,
};

/**
 * Reads the media library for the admin screens.
 *
 * Kept out of the "use server" action module deliberately: every export from
 * one of those becomes a callable endpoint, and the library listing should
 * only ever be reachable through an authenticated page render.
 */
export async function listMedia() {
  return db.select(LIBRARY_COLUMNS).from(media).orderBy(desc(media.createdAt));
}

/** Photos only — what the cover and gallery pickers offer. */
export async function listImages() {
  return db
    .select(LIBRARY_COLUMNS)
    .from(media)
    .where(like(media.mimeType, "image/%"))
    .orderBy(desc(media.createdAt));
}

/** Attachments (PDFs) only. */
export async function listFiles() {
  return db
    .select(LIBRARY_COLUMNS)
    .from(media)
    .where(not(like(media.mimeType, "image/%")))
    .orderBy(desc(media.createdAt));
}
