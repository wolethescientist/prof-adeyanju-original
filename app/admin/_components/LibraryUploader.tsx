"use client";

import { CheckCircle2, Loader2, Upload } from "lucide-react";
import { unstable_rethrow, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { MAX_PDF_LABEL, MAX_UPLOAD_LABEL } from "@/lib/cms/constants";
import Dropzone from "./editor/Dropzone";
import { FieldError } from "./editor/parts";
import { sendUpload } from "./editor/upload-client";

/**
 * The library's upload area: drop any number of photos and PDFs at once.
 * Each one is described by its file name to start with; the description can
 * be refined on its card below.
 */
export default function LibraryUploader() {
  const router = useRouter();
  const [uploading, startUpload] = useTransition();
  const [progress, setProgress] = useState<string | null>(null);
  const [problems, setProblems] = useState<string[]>([]);
  const [done, setDone] = useState<string | null>(null);

  const upload = (files: File[]) => {
    setProblems([]);
    setDone(null);
    startUpload(async () => {
      const failed: string[] = [];
      let added = 0;
      for (const [i, file] of files.entries()) {
        setProgress(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
        try {
          const kind = file.type === "application/pdf" ? "pdf" : "image";
          await sendUpload(file, kind, file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
          added++;
        } catch (reason) {
          unstable_rethrow(reason);
          failed.push(`${file.name}: ${reason instanceof Error ? reason.message : "could not be uploaded."}`);
        }
      }
      setProgress(null);
      setProblems(failed);
      if (added > 0) {
        setDone(`${added} ${added === 1 ? "file" : "files"} added to the library.`);
        router.refresh();
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Dropzone
        accept="image/jpeg,image/png,image/webp,image/gif,application/pdf"
        multiple
        onFiles={upload}
        disabled={uploading}
        label="Upload photos or PDFs"
        className="bg-card"
      >
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
          <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
            {uploading ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : <Upload className="size-5" aria-hidden="true" />}
          </span>
          <div>
            <p className="font-semibold">{progress ?? "Drop photos or PDFs here"}</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Or click to choose files. Photos up to {MAX_UPLOAD_LABEL} (large ones are resized for you) · PDFs up to {MAX_PDF_LABEL}.
            </p>
          </div>
        </div>
      </Dropzone>
      {done && (
        <p className="flex items-center gap-2 text-sm font-semibold text-primary">
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {done}
        </p>
      )}
      {problems.map((message) => (
        <FieldError key={message} message={message} />
      ))}
    </div>
  );
}
