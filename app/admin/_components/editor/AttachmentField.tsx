"use client";

import { ExternalLink, FileText, FileUp, Loader2, Trash2 } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { MAX_PDF_LABEL } from "@/lib/cms/constants";
import { formatBytes } from "@/lib/cms/media-types";
import { mediaUrl } from "@/lib/cms/media-url";
import type { Field } from "@/lib/cms/registry";
import { useEditorContext } from "./context";
import Dropzone from "./Dropzone";
import { FieldError, FieldHelp, FieldLabel } from "./parts";
import LibraryDialog from "./LibraryDialog";
import { sendUpload } from "./upload-client";

/** A PDF visitors can download from the article's page. */
export default function AttachmentField({
  field,
  defaultValue,
  error,
}: {
  field: Field;
  defaultValue: string;
  error?: string;
}) {
  const { files, remember, title } = useEditorContext();
  const [id, setId] = useState(defaultValue);
  const [problem, setProblem] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, startUpload] = useTransition();

  const chosen = files.find((file) => file.id === id);

  const upload = (picked: File[]) => {
    const file = picked[0];
    if (!file) return;
    setProblem(null);
    startUpload(async () => {
      try {
        const item = await sendUpload(file, "pdf", title() || file.name);
        remember(item);
        setId(item.id);
      } catch (reason) {
        unstable_rethrow(reason);
        setProblem(reason instanceof Error ? reason.message : "That PDF could not be uploaded.");
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <FieldLabel field={field} />
      <input type="hidden" name={field.name} value={chosen ? id : ""} />

      {chosen ? (
        <div className="flex items-center gap-3 rounded-xl border bg-background p-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <div className="min-w-0 grow">
            <p className="truncate text-sm font-semibold" title={chosen.filename}>
              {chosen.filename}
            </p>
            <p className="text-xs text-muted-foreground">{formatBytes(chosen.byteSize)}</p>
          </div>
          <a
            href={mediaUrl(chosen)!}
            target="_blank"
            rel="noopener noreferrer"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary"
            aria-label="Open the PDF in a new tab"
          >
            <ExternalLink className="size-4" />
          </a>
          <button
            type="button"
            onClick={() => setId("")}
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive cursor-pointer"
            aria-label="Remove the PDF"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <Dropzone accept="application/pdf" onFiles={upload} disabled={uploading} label="Upload a PDF">
          <div className="flex items-center gap-3 px-4 py-4">
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-secondary text-primary">
              {uploading ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <FileUp className="size-4" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">{uploading ? "Uploading…" : "Add a PDF"}</p>
              <p className="text-xs text-muted-foreground">Drop it here or click · up to {MAX_PDF_LABEL}</p>
            </div>
          </div>
        </Dropzone>
      )}

      {!chosen && files.length > 0 && (
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="self-start text-xs font-semibold text-primary hover:underline underline-offset-4 cursor-pointer"
        >
          Or choose one already uploaded
        </button>
      )}
      {problem && <FieldError message={problem} />}
      {error && <FieldError message={error} />}
      <FieldHelp field={field} />

      <LibraryDialog
        open={picking}
        onClose={() => setPicking(false)}
        items={files}
        title="Choose a PDF"
        onPick={([item]) => item && setId(item.id)}
      />
    </div>
  );
}
