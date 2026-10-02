import {
  MAX_IMAGE_DIMENSION,
  MAX_REQUEST_BYTES,
  MAX_REQUEST_LABEL,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_LABEL,
  imageTooLargeMessage,
} from "./constants";

/**
 * Makes a picked image small enough to send, in the browser.
 *
 * Photos straight off a phone are routinely 5–8MB, more than one request may
 * carry (see MAX_REQUEST_BYTES). Anything over that is scaled to fit within
 * the same box the server resizes to anyway, and re-encoded. Files already
 * small enough are returned untouched, so the server's sharp pipeline
 * (lib/cms/optimize.ts) still sees the original.
 *
 * Browsers apply the EXIF orientation when decoding, so portrait photos stay
 * upright, and drawing to a canvas drops the camera metadata, GPS included.
 *
 * Throws an Error whose message is written for the person uploading.
 */
export async function shrinkForUpload(file: File): Promise<File> {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(imageTooLargeMessage(file.size, MAX_UPLOAD_LABEL));
  }
  if (file.size <= MAX_REQUEST_BYTES) return file;

  /* Re-encoding a GIF would flatten its animation. */
  if (file.type === "image/gif") {
    throw new Error(imageTooLargeMessage(file.size, MAX_REQUEST_LABEL, "GIF"));
  }

  const tooLarge = new Error(imageTooLargeMessage(file.size, MAX_REQUEST_LABEL));

  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = url;
    await image.decode().catch(() => {
      throw new Error(
        "This image could not be opened. It may be damaged or in an unusual format — try saving it again as a JPEG and uploading that."
      );
    });

    const scale = Math.min(
      1,
      MAX_IMAGE_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight)
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(image.naturalWidth * scale);
    canvas.height = Math.round(image.naturalHeight * scale);
    const context = canvas.getContext("2d");
    if (!context) throw tooLarge;

    /* WebP keeps a PNG's transparency. Browsers that cannot encode WebP hand
       back a PNG instead, so those fall through to JPEG on white. */
    const types =
      file.type === "image/jpeg" ? ["image/jpeg"] : ["image/webp", "image/jpeg"];

    for (const type of types) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (type === "image/jpeg") {
        context.fillStyle = "#fff";
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      for (const quality of [0.85, 0.75, 0.6]) {
        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob(resolve, type, quality)
        );
        if (!blob || blob.type !== type) break;
        if (blob.size <= MAX_REQUEST_BYTES) {
          const extension = type === "image/jpeg" ? "jpg" : "webp";
          const name = `${file.name.replace(/\.[^.]+$/, "")}.${extension}`;
          return new File([blob], name, {
            type,
            lastModified: file.lastModified,
          });
        }
      }
    }
    throw tooLarge;
  } finally {
    URL.revokeObjectURL(url);
  }
}
