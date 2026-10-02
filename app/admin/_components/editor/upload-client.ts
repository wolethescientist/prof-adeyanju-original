import { unstable_rethrow } from "next/navigation";
import {
  MAX_PDF_BYTES,
  MAX_PDF_LABEL,
  MAX_REQUEST_BYTES,
  MAX_REQUEST_LABEL,
  imageTooLargeMessage,
} from "@/lib/cms/constants";
import type { MediaItem } from "@/lib/cms/media-types";
import { shrinkForUpload } from "@/lib/cms/shrink-image";
import { uploadInline } from "../../_actions/media";

/**
 * Sends one file from the article editor to the library and returns it.
 *
 * Photos are shrunk in the browser first when they need to be; PDFs are
 * checked against their limit before anything is sent. Every failure comes
 * back as an Error whose message can be shown as it is. Call it inside a
 * transition: a redirect (an expired session) is rethrown so the router can
 * take the person to the login screen.
 */
export async function sendUpload(
  file: File,
  kind: "image" | "pdf",
  alt: string
): Promise<MediaItem> {
  let toSend = file;
  if (kind === "image") {
    if (!file.type.startsWith("image/")) {
      throw new Error(`“${file.name}” isn't a photo. Images must be JPEG, PNG, WebP or GIF.`);
    }
    toSend = await shrinkForUpload(file);
  } else {
    if (file.type !== "application/pdf") {
      throw new Error(`“${file.name}” isn't a PDF. Attachments must be PDF files.`);
    }
    if (file.size > MAX_PDF_BYTES) {
      throw new Error(imageTooLargeMessage(file.size, MAX_PDF_LABEL, "PDF"));
    }
  }

  const form = new FormData();
  form.set("file", toSend);
  form.set("alt", alt);
  form.set("kind", kind);

  let result: Awaited<ReturnType<typeof uploadInline>>;
  try {
    result = await uploadInline(form);
  } catch (reason) {
    unstable_rethrow(reason);
    const message = reason instanceof Error ? reason.message : "";
    if (toSend.size > MAX_REQUEST_BYTES || /too large|exceeded/i.test(message)) {
      throw new Error(imageTooLargeMessage(toSend.size, MAX_REQUEST_LABEL, kind === "pdf" ? "PDF" : "image"));
    }
    throw new Error(
      "The upload didn’t go through. Check your internet connection and try again."
    );
  }

  if (result.error || !result.item) throw new Error(result.error ?? "The upload failed.");
  return result.item;
}

/** Files from a drop or a file input, as an array. */
export function filesFrom(list: FileList | null | undefined) {
  return list ? Array.from(list) : [];
}
