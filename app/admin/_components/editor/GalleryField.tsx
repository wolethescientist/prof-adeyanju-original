"use client";

import { ArrowLeft, ArrowRight, Images, Loader2, Plus, X } from "lucide-react";
import { unstable_rethrow } from "next/navigation";
import { useState, useTransition } from "react";
import { mediaUrl } from "@/lib/cms/media-url";
import type { Field } from "@/lib/cms/registry";
import { useEditorContext } from "./context";
import Dropzone from "./Dropzone";
import { FieldError, FieldHelp, FieldLabel } from "./parts";
import LibraryDialog from "./LibraryDialog";
import { sendUpload } from "./upload-client";

const ACCEPT = "image/jpeg,image/png,image/webp,image/gif";

/**
 * The article's photo gallery: drop several photos at once, put them in
 * order, take any out. The order here is the order on the page.
 */
export default function GalleryField({
  field,
  defaultValue,
  error,
}: {
  field: Field;
  defaultValue: string[];
  error?: string;
}) {
  const { images, remember, title } = useEditorContext();
  const [ids, setIds] = useState<string[]>(defaultValue);
  const [problems, setProblems] = useState<string[]>([]);
  const [progress, setProgress] = useState<string | null>(null);
  const [picking, setPicking] = useState(false);
  const [uploading, startUpload] = useTransition();

  const byId = new Map(images.map((image) => [image.id, image]));
  const photos = ids.map((id) => byId.get(id)).filter((image) => image !== undefined);

  const upload = (files: File[]) => {
    setProblems([]);
    startUpload(async () => {
      const failed: string[] = [];
      for (const [i, file] of files.entries()) {
        setProgress(files.length > 1 ? `Uploading ${i + 1} of ${files.length}…` : "Uploading…");
        try {
          const item = await sendUpload(file, "image", title());
          remember(item);
          setIds((current) => (current.includes(item.id) ? current : [...current, item.id]));
        } catch (reason) {
          unstable_rethrow(reason);
          failed.push(
            `${file.name}: ${reason instanceof Error ? reason.message : "could not be uploaded."}`
          );
        }
      }
      setProgress(null);
      setProblems(failed);
    });
  };

  const move = (index: number, by: -1 | 1) =>
    setIds((current) => {
      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(index + by, 0, item);
      return next;
    });

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <FieldLabel field={field} />
        {photos.length > 0 && (
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.14em] text-muted-foreground">
            {photos.length} {photos.length === 1 ? "photo" : "photos"}
          </span>
        )}
      </div>
      {photos.map((photo) => (
        <input key={photo.id} type="hidden" name={field.name} value={photo.id} />
      ))}

      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {photos.map((photo, index) => (
            <li key={photo.id} className="group relative overflow-hidden rounded-xl border bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={mediaUrl(photo)!} alt={photo.alt} className="aspect-[4/3] w-full object-cover" />
              <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[0.65rem] text-white">
                {index + 1}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-ink/75 to-transparent p-2 pt-8 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity">
                <span className="flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => move(index, -1)}
                    className="grid size-8 place-items-center rounded-full bg-white/95 text-foreground hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    aria-label={`Move photo ${index + 1} earlier`}
                  >
                    <ArrowLeft className="size-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === photos.length - 1}
                    onClick={() => move(index, 1)}
                    className="grid size-8 place-items-center rounded-full bg-white/95 text-foreground hover:bg-white disabled:opacity-40 cursor-pointer disabled:cursor-default"
                    aria-label={`Move photo ${index + 1} later`}
                  >
                    <ArrowRight className="size-4" />
                  </button>
                </span>
                <button
                  type="button"
                  onClick={() => setIds((current) => current.filter((id) => id !== photo.id))}
                  className="grid size-8 place-items-center rounded-full bg-white/95 text-destructive hover:bg-white cursor-pointer"
                  aria-label={`Remove photo ${index + 1} from the gallery`}
                >
                  <X className="size-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dropzone accept={ACCEPT} multiple onFiles={upload} disabled={uploading} label="Upload photos for the gallery">
        <div className="flex flex-col items-center gap-3 px-6 py-7 text-center sm:flex-row sm:text-left">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-primary">
            {uploading ? (
              <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-5" aria-hidden="true" />
            )}
          </span>
          <div className="grow">
            <p className="text-sm font-semibold">{progress ?? "Add photos"}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Drop several at once, or click to choose them.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setPicking(true)}
            className="pointer-events-auto inline-flex items-center gap-1.5 rounded-full border bg-card px-3.5 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
          >
            <Images className="size-3.5" aria-hidden="true" />
            Choose from library
          </button>
        </div>
      </Dropzone>

      {problems.map((message) => (
        <FieldError key={message} message={message} />
      ))}
      {error && <FieldError message={error} />}
      <FieldHelp field={field} />

      <LibraryDialog
        open={picking}
        onClose={() => setPicking(false)}
        items={images}
        multiple
        exclude={ids}
        title="Add photos from the library"
        onPick={(items) => setIds((current) => [...current, ...items.map((item) => item.id)])}
      />
    </div>
  );
}
