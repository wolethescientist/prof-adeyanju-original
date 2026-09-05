import "server-only";

import sharp from "sharp";

/**
 * Prepares an uploaded image for storage.
 *
 * The team will often upload straight from a phone or a press pack, where a
 * single photo can be 6–8MB and 6000px wide — far more than any layout on the
 * site uses. Storing that verbatim wastes database space and makes the first
 * render slow, so each upload is capped, re-encoded and stripped of camera
 * metadata (which also removes GPS coordinates from phone photos) before it
 * ever reaches Postgres.
 *
 * `next/image` still resizes and re-formats on delivery; this is about what we
 * keep, not what we serve.
 */

/** Nothing in the design is displayed wider or taller than this. */
const MAX_DIMENSION = 2560;
const JPEG_QUALITY = 82;
const WEBP_QUALITY = 82;

export type Optimized = {
  data: Buffer;
  mimeType: string;
  width: number | null;
  height: number | null;
  /** Bytes saved, for the message shown back to the uploader. */
  savedBytes: number;
};

export async function optimizeImage(
  input: Buffer,
  mimeType: string
): Promise<Optimized> {
  /* Animated GIFs would lose their animation on re-encode, and they are rare
     enough here that passing them through untouched is the safer trade. */
  if (mimeType === "image/gif") {
    const meta = await safeMetadata(input);
    return {
      data: input,
      mimeType,
      width: meta?.width ?? null,
      height: meta?.height ?? null,
      savedBytes: 0,
    };
  }

  try {
    const pipeline = sharp(input, { failOn: "none" })
      /* Honour the EXIF orientation flag before we strip EXIF, otherwise
         portrait phone photos come out on their side. */
      .rotate()
      .resize({
        width: MAX_DIMENSION,
        height: MAX_DIMENSION,
        fit: "inside",
        withoutEnlargement: true,
      });

    const encoded =
      mimeType === "image/png"
        ? await pipeline.png({ compressionLevel: 9, palette: true }).toBuffer({ resolveWithObject: true })
        : mimeType === "image/webp"
          ? await pipeline.webp({ quality: WEBP_QUALITY }).toBuffer({ resolveWithObject: true })
          : await pipeline
              .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
              .toBuffer({ resolveWithObject: true });

    /* Re-encoding a small, already-optimised file can make it bigger. If that
       happens, keep the original. */
    if (encoded.data.byteLength >= input.byteLength) {
      const meta = await safeMetadata(input);
      return {
        data: input,
        mimeType,
        width: meta?.width ?? null,
        height: meta?.height ?? null,
        savedBytes: 0,
      };
    }

    return {
      data: encoded.data,
      mimeType,
      width: encoded.info.width,
      height: encoded.info.height,
      savedBytes: input.byteLength - encoded.data.byteLength,
    };
  } catch {
    /* A file sharp cannot read still gets stored — the upload already passed
       MIME and size checks, and a picture the team can see is better than a
       rejected upload. */
    return { data: input, mimeType, width: null, height: null, savedBytes: 0 };
  }
}

async function safeMetadata(buffer: Buffer) {
  try {
    return await sharp(buffer, { failOn: "none" }).metadata();
  } catch {
    return null;
  }
}
