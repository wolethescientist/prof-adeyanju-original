/** Upload ceiling, shared by the server action and the upload form's help text. */
export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB
export const MAX_UPLOAD_LABEL = "8MB";

/** Nothing in the design is displayed wider or taller than this. */
export const MAX_IMAGE_DIMENSION = 2560;

/**
 * The most the browser may actually send in one upload request.
 *
 * Vercel refuses any function request body over 4.5MB before our code runs,
 * and `serverActions.bodySizeLimit` in next.config.ts is set to match. The
 * upload form shrinks anything larger than this in the browser first, leaving
 * room for the multipart overhead and the description field.
 */
export const MAX_REQUEST_BYTES = 4 * 1024 * 1024; // 4 MB
export const MAX_REQUEST_LABEL = "4MB";

/** PDFs can't be shrunk in the browser the way photos can, so this is their ceiling. */
export const MAX_PDF_BYTES = MAX_REQUEST_BYTES;
export const MAX_PDF_LABEL = MAX_REQUEST_LABEL;

/** One wording for "too big", wherever that is caught. */
export function imageTooLargeMessage(
  bytes: number,
  limitLabel: string,
  kind: "image" | "GIF" | "PDF" = "image"
) {
  const megabytes = (bytes / 1024 / 1024).toFixed(1);
  const tip =
    kind === "PDF"
      ? "most PDF tools have a “reduce file size” option"
      : "most photo editors can save a smaller copy";
  return `This ${kind} is too large (${megabytes}MB). Please compress it to under ${limitLabel} and try again — ${tip}.`;
}
