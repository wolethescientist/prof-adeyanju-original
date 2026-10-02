"use server";

import { createHash } from "node:crypto";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { awards, initiatives, media, pressItems } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { imageSize } from "@/lib/cms/image-size";
import { optimizeImage } from "@/lib/cms/optimize";
import { LIBRARY_COLUMNS } from "@/lib/cms/media";
import type { MediaItem } from "@/lib/cms/media-types";
import {
  MAX_PDF_BYTES,
  MAX_PDF_LABEL,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  imageTooLargeMessage,
} from "@/lib/cms/constants";

/** Formats the browser accepts and we know how to measure. */
const IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const PDF_TYPE = "application/pdf";

export type InlineUpload = { item?: MediaItem; error?: string };

type Stored =
  | { ok: true; item: MediaItem }
  | { ok: false; error: string };

/**
 * Checks, optimises and stores one uploaded file — an image, or a PDF when
 * `allowPdf` is set.
 */
async function storeFile(
  file: FormDataEntryValue | null,
  alt: string,
  userId: string,
  allowPdf: boolean
): Promise<Stored> {
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const isPdf = file.type === PDF_TYPE;
  if (isPdf ? !allowPdf : !IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      error: allowPdf
        ? "Attachments must be PDF files."
        : "Images must be JPEG, PNG, WebP or GIF.",
    };
  }
  if (isPdf && file.size > MAX_PDF_BYTES) {
    return { ok: false, error: imageTooLargeMessage(file.size, MAX_PDF_LABEL, "PDF") };
  }
  if (!isPdf && file.size > MAX_UPLOAD_BYTES) {
    return { ok: false, error: imageTooLargeMessage(file.size, MAX_UPLOAD_LABEL) };
  }

  const original = Buffer.from(await file.arrayBuffer());

  let buffer: Buffer = original;
  let mimeType = file.type;
  let width: number | null = null;
  let height: number | null = null;

  if (isPdf) {
    /* The browser's word for the type is only a claim; check the bytes. */
    if (original.subarray(0, 5).toString("latin1") !== "%PDF-") {
      return {
        ok: false,
        error: "This file could not be read as a PDF. Try exporting it again as a PDF and uploading that.",
      };
    }
  } else {
    /* Resize and re-encode before storing — see lib/cms/optimize.ts. The
       checksum is taken from the processed bytes, since those are what we
       serve and what the cache-busting URL has to track. */
    const optimized = await optimizeImage(original, file.type);
    buffer = optimized.data;
    mimeType = optimized.mimeType;
    /* sharp reports the dimensions it produced; the header parser is the
       fallback for anything it could not process. */
    const fallback = imageSize(buffer, mimeType);
    width = optimized.width ?? fallback?.width ?? null;
    height = optimized.height ?? fallback?.height ?? null;
  }

  const checksum = createHash("sha256").update(buffer).digest("hex");

  /* The same file uploaded twice should not become two rows. */
  const [existing] = await db
    .select(LIBRARY_COLUMNS)
    .from(media)
    .where(eq(media.checksum, checksum))
    .limit(1);
  if (existing) return { ok: true, item: existing };

  const [item] = await db
    .insert(media)
    .values({
      filename: file.name.slice(0, 200),
      mimeType,
      byteSize: buffer.byteLength,
      width,
      height,
      alt: alt.slice(0, 500),
      checksum,
      data: buffer,
      uploadedById: userId,
    })
    .returning(LIBRARY_COLUMNS);

  return { ok: true, item };
}

/**
 * Every upload — from the library's drop area, or a cover photo, gallery
 * photos or PDF dropped onto an article while it's being written. The
 * description defaults to the article's title (or the file name), and can be
 * refined in the library. Uploading a file that is already in the library
 * simply returns that one.
 */
export async function uploadInline(formData: FormData): Promise<InlineUpload> {
  const user = await requireUser();

  const file = formData.get("file");
  const alt =
    String(formData.get("alt") ?? "").trim() ||
    (file instanceof File ? file.name.replace(/\.[^.]+$/, "") : "");

  const stored = await storeFile(file, alt, user.id, formData.get("kind") === "pdf");
  if (!stored.ok) return { error: stored.error };

  revalidatePath("/admin/media");
  return { item: stored.item };
}

export async function updateMediaAlt(id: string, formData: FormData) {
  await requireUser();
  const alt = String(formData.get("alt") ?? "").trim();
  if (!alt) return;

  await db.update(media).set({ alt: alt.slice(0, 500) }).where(eq(media.id, id));
  revalidatePath("/admin/media");
}

/**
 * Deleting a file leaves any content referencing it intact — cover and PDF
 * foreign keys are ON DELETE SET NULL, and the file is taken out of every
 * gallery here — so an article loses a picture rather than disappearing.
 */
export async function deleteMedia(id: string) {
  await requireUser();
  await db.transaction(async (tx) => {
    for (const table of [awards, pressItems, initiatives]) {
      await tx
        .update(table)
        .set({ galleryIds: sql`array_remove(${table.galleryIds}, ${id}::uuid)` })
        .where(sql`${id}::uuid = ANY(${table.galleryIds})`);
    }
    await tx.delete(media).where(eq(media.id, id));
  });
  revalidatePath("/admin/media");
  revalidatePath("/", "layout");
}
