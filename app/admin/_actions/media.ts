"use server";

import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { media } from "@/db/schema";
import { requireUser } from "@/lib/auth/session";
import { imageSize } from "@/lib/cms/image-size";
import { optimizeImage } from "@/lib/cms/optimize";
import { MAX_UPLOAD_BYTES, MAX_UPLOAD_LABEL } from "@/lib/cms/constants";

/** Formats the browser accepts and we know how to measure. */
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

export type UploadState = { error?: string; success?: string };

export async function uploadMedia(
  _prev: UploadState,
  formData: FormData
): Promise<UploadState> {
  const user = await requireUser();

  const file = formData.get("file");
  const alt = String(formData.get("alt") ?? "").trim();

  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image to upload." };
  }
  if (!ALLOWED.has(file.type)) {
    return { error: "Images must be JPEG, PNG, WebP or GIF." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      error: `That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is ${MAX_UPLOAD_LABEL} — please resize it and try again.`,
    };
  }
  if (!alt) {
    return {
      error:
        "Please describe the image. The description is read aloud by screen readers and shown if the image fails to load.",
    };
  }

  const original = Buffer.from(await file.arrayBuffer());

  /* Resize and re-encode before storing — see lib/cms/optimize.ts. The
     checksum is taken from the processed bytes, since those are what we serve
     and what the cache-busting URL has to track. */
  const optimized = await optimizeImage(original, file.type);
  const buffer = optimized.data;
  const checksum = createHash("sha256").update(buffer).digest("hex");

  /* The same file uploaded twice should not become two rows. */
  const [duplicate] = await db
    .select({ id: media.id })
    .from(media)
    .where(eq(media.checksum, checksum))
    .limit(1);
  if (duplicate) {
    return { error: "That image is already in the library." };
  }

  /* sharp reports the dimensions it produced; the header parser is the
     fallback for anything it could not process. */
  const fallbackSize = imageSize(buffer, optimized.mimeType);

  await db.insert(media).values({
    filename: file.name.slice(0, 200),
    mimeType: optimized.mimeType,
    byteSize: buffer.byteLength,
    width: optimized.width ?? fallbackSize?.width ?? null,
    height: optimized.height ?? fallbackSize?.height ?? null,
    alt: alt.slice(0, 500),
    checksum,
    data: buffer,
    uploadedById: user.id,
  });

  revalidatePath("/admin/media");

  const saved =
    optimized.savedBytes > 0
      ? ` Optimised — ${(optimized.savedBytes / 1024 / 1024).toFixed(1)}MB smaller.`
      : "";
  return { success: `“${file.name}” uploaded.${saved}` };
}

export async function updateMediaAlt(id: string, formData: FormData) {
  await requireUser();
  const alt = String(formData.get("alt") ?? "").trim();
  if (!alt) return;

  await db.update(media).set({ alt: alt.slice(0, 500) }).where(eq(media.id, id));
  revalidatePath("/admin/media");
}

/**
 * Deleting an image leaves any content referencing it intact — the foreign
 * keys are ON DELETE SET NULL, so a row loses its picture rather than
 * disappearing from the site.
 */
export async function deleteMedia(id: string) {
  await requireUser();
  await db.delete(media).where(eq(media.id, id));
  revalidatePath("/admin/media");
  revalidatePath("/");
}
