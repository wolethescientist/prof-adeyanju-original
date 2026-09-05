import "server-only";

import { desc } from "drizzle-orm";
import { db } from "@/db";
import { media } from "@/db/schema";

/**
 * Reads the media library for the admin screens.
 *
 * Kept out of the "use server" action module deliberately: every export from
 * one of those becomes a callable endpoint, and the library listing should
 * only ever be reachable through an authenticated page render.
 */
export async function listMedia() {
  return db
    .select({
      id: media.id,
      filename: media.filename,
      alt: media.alt,
      checksum: media.checksum,
      width: media.width,
      height: media.height,
      byteSize: media.byteSize,
      createdAt: media.createdAt,
    })
    .from(media)
    .orderBy(desc(media.createdAt));
}

export type MediaItem = Awaited<ReturnType<typeof listMedia>>[number];
