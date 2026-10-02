"use client";

import { Check, FileText, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatBytes, isPdf, type MediaItem } from "@/lib/cms/media-types";
import { mediaUrl } from "@/lib/cms/media-url";
import { cn } from "@/lib/utils";

/**
 * Pick from what's already uploaded: one item (a cover, a PDF) or several
 * (gallery photos). A native <dialog>, so focus, Escape and the backdrop
 * behave as people expect.
 */
export default function LibraryDialog({
  open,
  onClose,
  items,
  multiple = false,
  exclude = [],
  onPick,
  title,
}: {
  open: boolean;
  onClose: () => void;
  items: MediaItem[];
  multiple?: boolean;
  /** Ids already in use — shown as added rather than offered again. */
  exclude?: string[];
  onPick: (items: MediaItem[]) => void;
  title: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    if (open && !element.open) {
      setSelected([]);
      setQuery("");
      element.showModal();
    }
    if (!open && element.open) element.close();
  }, [open]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (item) => item.filename.toLowerCase().includes(q) || item.alt.toLowerCase().includes(q)
    );
  }, [items, query]);

  const choose = (item: MediaItem) => {
    if (!multiple) {
      onPick([item]);
      onClose();
      return;
    }
    setSelected((current) =>
      current.includes(item.id) ? current.filter((id) => id !== item.id) : [...current, item.id]
    );
  };

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      aria-label={title}
      className="m-auto w-[min(56rem,calc(100vw-2rem))] max-h-[min(44rem,calc(100dvh-2rem))] rounded-2xl border bg-card p-0 text-foreground shadow-2xl backdrop:bg-ink/50 backdrop:backdrop-blur-[2px]"
    >
      <div className="flex max-h-[inherit] flex-col">
        <div className="flex items-center justify-between gap-4 border-b px-5 py-4">
          <h2 className="font-heading text-xl font-medium">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground cursor-pointer"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="border-b px-5 py-3">
          <label className="relative block">
            <span className="sr-only">Search the library</span>
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by file name or description"
              className="h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </label>
        </div>

        <div className="min-h-0 grow overflow-y-auto p-5">
          {shown.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              {items.length === 0
                ? "Nothing has been uploaded yet. Close this and drop a file onto the form to upload it."
                : "Nothing matches that search."}
            </p>
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {shown.map((item) => {
                const used = exclude.includes(item.id);
                const picked = selected.includes(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      disabled={used}
                      onClick={() => choose(item)}
                      aria-pressed={multiple ? picked : undefined}
                      className={cn(
                        "group relative block w-full overflow-hidden rounded-xl border text-left transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-45",
                        picked ? "border-primary ring-2 ring-primary" : "hover:border-primary/50"
                      )}
                    >
                      {isPdf(item) ? (
                        <span className="grid aspect-[4/3] place-items-center bg-muted">
                          <FileText className="size-10 text-primary" aria-hidden="true" />
                        </span>
                      ) : (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaUrl(item)!}
                          alt=""
                          loading="lazy"
                          className="aspect-[4/3] w-full bg-muted object-cover"
                        />
                      )}
                      <span className="block px-3 py-2">
                        <span className="block truncate text-xs font-semibold">{item.filename}</span>
                        <span className="block truncate text-[0.7rem] text-muted-foreground">
                          {used ? "Already added" : isPdf(item) ? formatBytes(item.byteSize) : item.alt}
                        </span>
                      </span>
                      {picked && (
                        <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-primary text-primary-foreground">
                          <Check className="size-3.5" aria-hidden="true" />
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {multiple && (
          <div className="flex items-center justify-end gap-3 border-t px-5 py-4">
            <Button type="button" variant="ghost" size="lg" className="h-10 font-semibold" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              size="lg"
              className="h-10 font-bold"
              disabled={selected.length === 0}
              onClick={() => {
                onPick(items.filter((item) => selected.includes(item.id)));
                onClose();
              }}
            >
              {selected.length === 0
                ? "Choose photos"
                : `Add ${selected.length} ${selected.length === 1 ? "photo" : "photos"}`}
            </Button>
          </div>
        )}
      </div>
    </dialog>
  );
}
