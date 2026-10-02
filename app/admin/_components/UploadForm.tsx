"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { unstable_rethrow } from "next/navigation";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia, type UploadState } from "../_actions/media";
import {
  MAX_REQUEST_BYTES,
  MAX_REQUEST_LABEL,
  MAX_UPLOAD_LABEL,
  imageTooLargeMessage,
} from "@/lib/cms/constants";
import { shrinkForUpload } from "@/lib/cms/shrink-image";

/**
 * Runs the upload action, turning a failed request into a message on the form
 * rather than the full-screen error page. Redirects still go through, so an
 * expired session lands on the login screen as usual.
 */
async function upload(prev: UploadState, formData: FormData): Promise<UploadState> {
  try {
    return await uploadMedia(prev, formData);
  } catch (reason) {
    unstable_rethrow(reason);
    const file = formData.get("file");
    const size = file instanceof File ? file.size : 0;
    const message = reason instanceof Error ? reason.message : "";
    if (size > MAX_REQUEST_BYTES || /too large|exceeded/i.test(message)) {
      return { error: imageTooLargeMessage(size, MAX_REQUEST_LABEL) };
    }
    return {
      error:
        "The upload didn’t go through. Check your internet connection and try again — if it keeps failing, compress the image to make it smaller first.",
    };
  }
}

function SubmitButton({ preparing }: { preparing: boolean }) {
  const { pending } = useFormStatus();
  const busy = pending || preparing;
  return (
    <Button type="submit" size="lg" disabled={busy} className="h-10 font-bold">
      {preparing ? "Preparing image…" : pending ? "Uploading…" : "Upload"}
      {!busy && <Upload data-icon="inline-end" />}
    </Button>
  );
}

export default function UploadForm() {
  const [state, formAction] = useActionState<UploadState, FormData>(upload, {});
  const [preview, setPreview] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  /* Counts picks, so a slow shrink can't overwrite a file chosen after it. */
  const pickRef = useRef(0);
  /* The last result, once a new file is picked — its message no longer applies. */
  const [dismissed, setDismissed] = useState<UploadState | null>(null);
  const shown = state === dismissed ? {} : state;
  const error = fileError ?? shown.error;

  /* Clear the picked file once the server confirms the upload. The reset has
     to happen here rather than inside a wrapper around `formAction` — that
     function must be handed to the form directly to be dispatched at all. */
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
      setPreview(null);
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="rounded-xl border bg-card p-5 flex flex-col gap-4"
    >
      <div className="flex flex-col gap-2">
        <Label htmlFor="file">Image file</Label>
        <Input
          id="file"
          name="file"
          type="file"
          required
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="h-auto py-2 cursor-pointer"
          onChange={async (event) => {
            const input = event.currentTarget;
            const picked = input.files?.[0];
            const pick = ++pickRef.current;
            setFileError(null);
            setDismissed(state);
            setPreview(null);
            if (!picked) return;

            /* Large photos are shrunk here and swapped into the input, so the
               form still submits straight to the action. */
            setPreparing(true);
            try {
              const file = await shrinkForUpload(picked);
              if (pick !== pickRef.current) return;
              if (file !== picked) {
                const transfer = new DataTransfer();
                transfer.items.add(file);
                input.files = transfer.files;
              }
              setPreview(URL.createObjectURL(file));
            } catch (reason) {
              if (pick !== pickRef.current) return;
              input.value = "";
              setFileError(
                reason instanceof Error
                  ? reason.message
                  : "That image could not be read. Please try another."
              );
            } finally {
              if (pick === pickRef.current) setPreparing(false);
            }
          }}
        />
        <p className="text-xs text-muted-foreground">
          JPEG, PNG, WebP or GIF, up to {MAX_UPLOAD_LABEL}.
        </p>
      </div>

      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt=""
          className="h-36 w-auto rounded-lg border object-cover"
        />
      )}

      <div className="flex flex-col gap-2">
        <Label htmlFor="alt">Describe the image</Label>
        <Input
          id="alt"
          name="alt"
          required
          maxLength={500}
          placeholder="Prof. Adeyanju receiving the NET5.5G Pioneer Award in Abuja"
        />
        <p className="text-xs text-muted-foreground">
          Read aloud by screen readers, and shown if the image cannot load.
        </p>
      </div>

      {error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          {error}
        </p>
      )}
      {shown.success && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {shown.success}
        </p>
      )}

      <div>
        <SubmitButton preparing={preparing} />
      </div>
    </form>
  );
}
