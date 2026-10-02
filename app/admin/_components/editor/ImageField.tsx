"use client";

import { ImagePlus, Images, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { mediaUrl } from "@/lib/cms/media-url";
import type { Field } from "@/lib/cms/registry";
import { cn } from "@/lib/utils";
import { useEditorContext } from "./context";
import Dropzone from "./Dropzone";
import { FieldError, FieldHelp, FieldLabel } from "./parts";
import LibraryDialog from "./LibraryDialog";
import { sendUpload } from "./upload-client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * One photo — an article's cover, or an image slot. Drop or choose a file to
 * upload it on the spot, or pick something already in the library.
 */
export default function ImageField({
  field,
  defaultValue,
  error,
}: {
  field: Field;
  defaultValue: string;
  error?: string;
}) {
  const { images, remember, title } = useEditorContext();
  const [id, setId] = useState(defaultValue);
  const [problem, setProblem] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, startUpload] = useTransition();

  const chosen = images.find((image) => image.id === id);
  const cover = field.appearance === "cover";

  const upload = (files: File[]) => {
    const file = files[0];
    if (!file) return;
    setProblem(null);
    startUpload(async () => {
      try {
        const item = await sendUpload(file, "image", title());
        remember(item);
        setId(item.id);
      } catch (reason) {
        unstable_rethrow(reason);
        setProblem(reason instanceof Error ? reason.message : "That photo could not be uploaded.");
      }
    });
  };

  const fromLibrary = (
    <button
      type="button"
      onClick={() => setPicking(true)}
      className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
    >
      <Images className="size-3.5" aria-hidden="true" />
      Choose from library
    </button>
  );

  return (
    <div className="flex flex-col gap-2">
      {!cover && <FieldLabel field={field} />}
      <input type="hidden" name={field.name} value={chosen ? id : ""} />

      {chosen ? (
        <div className={cn("group relative overflow-hidden bg-muted", cover ? "rounded-t-2xl" : "rounded-xl border")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(chosen)!}
            alt={chosen.alt}
            className={cn("w-full object-cover", cover ? "aspect-[21/9]" : "aspect-[16/9] max-h-64")}
          />
          {uploading && (
            <div className="absolute inset-0 grid place-items-center bg-ink/50 text-white">
              <Loader2 className="size-7 animate-spin" aria-label="Uploading" />
            </div>
          )}
          <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-end gap-2 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-10">
            {cover && (
              <span className="mr-auto rounded-full bg-ink/60 px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-white/90 backdrop-blur-sm">
                Cover photo
              </span>
            )}
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-white">
              <RefreshCw className="size-3.5" aria-hidden="true" />
              Replace
              <input
                type="file"
                accept={ACCEPT}
                hidden
                onChange={(event) => {
                  upload(Array.from(event.target.files ?? []));
                  event.target.value = "";
                }}
              />
            </label>
            <button
              type="button"
              onClick={() => setPicking(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-foreground hover:bg-white cursor-pointer"
            >
              <Images className="size-3.5" aria-hidden="true" />
              Library
            </button>
            <button
              type="button"
              onClick={() => setId("")}
              className="inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3.5 py-1.5 text-xs font-semibold text-destructive hover:bg-white cursor-pointer"
            >
              <Trash2 className="size-3.5" aria-hidden="true" />
              Remove
            </button>
          </div>
        </div>
      ) : (
        <Dropzone
          accept={ACCEPT}
          onFiles={upload}
          disabled={uploading}
          label={`Upload ${field.label.toLowerCase()}`}
          className={cn(cover ? "m-4 mb-0 rounded-xl" : "")}
        >
          <div className={cn("flex flex-col items-center justify-center gap-3 px-6 text-center", cover ? "py-12" : "py-8")}>
            <span className="grid size-12 place-items-center rounded-full bg-secondary text-primary">
              {uploading ? (
                <Loader2 className="size-5 animate-spin" aria-hidden="true" />
              ) : (
                <ImagePlus className="size-5" aria-hidden="true" />
              )}
            </span>
            <div>
              <p className="text-sm font-semibold">
                {uploading ? "Uploading…" : cover ? "Add a cover photo" : `Add ${field.label.toLowerCase()}`}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Drop a photo here or click to choose one. Large photos are resized for you.
              </p>
            </div>
            {fromLibrary}
          </div>
        </Dropzone>
      )}

      <div className={cn(cover && "px-6")}>
        {problem && <FieldError message={problem} />}
        {error && <FieldError message={error} />}
        {!cover && <FieldHelp field={field} />}
      </div>

      <LibraryDialog
        open={picking}
        onClose={() => setPicking(false)}
        items={images}
        title="Choose a photo"
        onPick={([item]) => item && setId(item.id)}
      />
    </div>
  );
}
