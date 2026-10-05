"use client";

import { ChevronLeft, ChevronRight, Download, X } from "lucide-react";
import Image from "next/image";
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Picture } from "@/app/lib/articles";
import { cn } from "@/lib/utils";

/**
 * Full-screen viewing for an article's photos.
 *
 * The cover at the top of the page and the gallery further down share one
 * viewer, so arrowing through from the cover continues into the gallery. It
 * is a native <dialog>: focus is trapped and Escape closes it for free.
 */

const LightboxContext = createContext<(index: number) => void>(() => {});

export function LightboxProvider({
  pictures,
  children,
}: {
  pictures: Picture[];
  children: React.ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [index, setIndex] = useState(0);
  const touchStart = useRef<number | null>(null);

  const open = useCallback((at: number) => {
    setIndex(at);
    dialog.current?.showModal();
  }, []);

  const step = useCallback(
    (by: number) =>
      setIndex((current) => (current + by + pictures.length) % pictures.length),
    [pictures.length]
  );

  useEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    element.addEventListener("keydown", onKey);
    return () => element.removeEventListener("keydown", onKey);
  }, [step]);

  const picture = pictures[index];
  const many = pictures.length > 1;

  return (
    <LightboxContext.Provider value={open}>
      {children}

      <dialog
        ref={dialog}
        aria-label="Photo viewer"
        className="m-0 h-dvh max-h-none w-screen max-w-none bg-transparent p-0 backdrop:bg-[#060a14]/95 backdrop:backdrop-blur-sm"
        onClick={(event) => {
          /* A click on the dark surround, not the photo or controls, closes it. */
          if (event.target === event.currentTarget) dialog.current?.close();
        }}
        onTouchStart={(event) => {
          touchStart.current = event.touches[0]?.clientX ?? null;
        }}
        onTouchEnd={(event) => {
          const start = touchStart.current;
          const end = event.changedTouches[0]?.clientX;
          touchStart.current = null;
          if (start == null || end == null || Math.abs(end - start) < 50) return;
          step(end < start ? 1 : -1);
        }}
      >
        {picture && (
          <div className="flex h-full flex-col text-white" onClick={(event) => {
            if (event.target === event.currentTarget) dialog.current?.close();
          }}>
            <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-6">
              <p className="text-xs text-white/70">
                {many ? `${index + 1} / ${pictures.length}` : ""}
              </p>
              <div className="flex items-center gap-1">
                <a
                  href={picture.src}
                  download
                  className="inline-flex h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold text-white/85 hover:bg-white/10 hover:text-white transition-colors"
                >
                  <Download className="size-4" aria-hidden="true" />
                  <span className="hidden sm:inline">Download</span>
                </a>
                <button
                  type="button"
                  onClick={() => dialog.current?.close()}
                  className="grid size-10 place-items-center rounded-full text-white/85 hover:bg-white/10 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close"
                  autoFocus
                >
                  <X className="size-5" />
                </button>
              </div>
            </div>

            <div
              className="relative flex min-h-0 grow items-center justify-center px-2 md:px-20"
              onClick={(event) => {
                if (event.target === event.currentTarget) dialog.current?.close();
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                key={picture.id}
                src={picture.src}
                alt={picture.alt}
                className="max-h-full max-w-full rounded-lg object-contain shadow-2xl animate-in fade-in duration-300"
              />
              {many && (
                <>
                  <button
                    type="button"
                    onClick={() => step(-1)}
                    className="absolute left-2 md:left-6 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Previous photo"
                  >
                    <ChevronLeft className="size-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() => step(1)}
                    className="absolute right-2 md:right-6 grid size-12 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
                    aria-label="Next photo"
                  >
                    <ChevronRight className="size-6" />
                  </button>
                </>
              )}
            </div>

            <p className="mx-auto max-w-3xl px-6 py-4 text-center text-sm text-white/75 leading-relaxed">
              {picture.alt}
            </p>
          </div>
        )}
      </dialog>
    </LightboxContext.Provider>
  );
}

/**
 * A photo on the page that opens the viewer at its own position. It is shown
 * whole, at its own proportions, with nothing behind it; a very tall photo is
 * capped to the height of the screen rather than cropped.
 */
export function ZoomableImage({
  picture,
  index,
  sizes,
  className,
  priority = false,
}: {
  picture: Picture;
  index: number;
  sizes: string;
  className?: string;
  priority?: boolean;
}) {
  const open = useContext(LightboxContext);
  return (
    <button
      type="button"
      onClick={() => open(index)}
      className={cn("block cursor-zoom-in", className)}
      /* A small image (a logo, a low-resolution photo) is never blown up
         past its real size, which would only blur it. */
      style={picture.width ? { maxWidth: picture.width } : undefined}
      aria-label={`View photo full size: ${picture.alt}`}
    >
      <Image
        src={picture.src}
        alt={picture.alt}
        width={picture.width ?? 1600}
        height={picture.height ?? 1000}
        sizes={sizes}
        priority={priority}
        className="h-auto w-full max-h-[78vh] object-contain"
      />
    </button>
  );
}

/** The photos under the story, each whole, in columns. `offset` is where its photos start in the viewer. */
export function Gallery({ pictures, offset }: { pictures: Picture[]; offset: number }) {
  return (
    <ul
      className={cn(
        "gap-4",
        /* Few photos get room to breathe; many sit in columns. */
        pictures.length === 1
          ? "mx-auto max-w-3xl"
          : pictures.length === 2
            ? "columns-1 sm:columns-2"
            : "columns-2 md:columns-3"
      )}
    >
      {pictures.map((picture, i) => (
        <li key={picture.id} className="mb-4 break-inside-avoid">
          <ZoomableImage
            picture={picture}
            index={offset + i}
            sizes="(min-width: 768px) 540px, 100vw"
            className="w-full overflow-hidden rounded-xl"
          />
        </li>
      ))}
    </ul>
  );
}
