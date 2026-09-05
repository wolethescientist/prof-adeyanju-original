"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadMedia, type UploadState } from "../_actions/media";
import { MAX_UPLOAD_LABEL } from "@/lib/cms/constants";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending} className="h-10 font-bold">
      {pending ? "Uploading…" : "Upload"}
      {!pending && <Upload data-icon="inline-end" />}
    </Button>
  );
}

export default function UploadForm() {
  const [state, formAction] = useActionState<UploadState, FormData>(
    uploadMedia,
    {}
  );
  const [preview, setPreview] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

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
          onChange={(event) => {
            const file = event.target.files?.[0];
            setPreview(file ? URL.createObjectURL(file) : null);
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

      {state.error && (
        <p
          role="alert"
          className="flex items-start gap-2 rounded-lg bg-destructive/10 px-3 py-2.5 text-sm font-medium text-destructive"
        >
          <AlertCircle className="size-4 shrink-0 mt-0.5" aria-hidden="true" />
          {state.error}
        </p>
      )}
      {state.success && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {state.success}
        </p>
      )}

      <div>
        <SubmitButton />
      </div>
    </form>
  );
}
