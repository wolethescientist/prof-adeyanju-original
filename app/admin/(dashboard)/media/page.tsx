import { ExternalLink, FileText } from "lucide-react";
import { listFiles, listImages } from "@/lib/cms/media";
import { formatBytes } from "@/lib/cms/media-types";
import { mediaUrl } from "@/lib/cms/media-url";
import ConfirmDelete from "@/app/admin/_components/ConfirmDelete";
import DescriptionEditor from "@/app/admin/_components/DescriptionEditor";
import LibraryUploader from "@/app/admin/_components/LibraryUploader";
import { deleteMedia } from "@/app/admin/_actions/media";

export default async function MediaPage() {
  const [images, files] = await Promise.all([listImages(), listFiles()]);

  return (
    <div className="flex flex-col gap-10">
      <div className="max-w-xl">
        <p className="text-xs font-medium text-muted-foreground">
          Library
        </p>
        <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight">Photos &amp; PDFs</h1>
        <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
          Everything uploaded to the site. You can also add photos and PDFs
          straight from an award, press item or initiative while writing it —
          they land here too.
        </p>
      </div>

      <LibraryUploader />

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-muted-foreground">
          {images.length} {images.length === 1 ? "photo" : "photos"}
        </h2>

        {images.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card p-10 text-center text-sm text-muted-foreground">
            No photos yet. Drop some above to get started.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((image) => (
              <li key={image.id} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
                <a href={mediaUrl(image)!} target="_blank" rel="noopener noreferrer" className="block bg-muted">
                  {/* Plain <img>: admin thumbnails of arbitrary uploads. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(image)!}
                    alt={image.alt}
                    className="h-44 w-full object-cover object-[50%_22%]"
                    loading="lazy"
                  />
                </a>
                <div className="flex grow flex-col gap-3 p-4">
                  <div>
                    <p className="truncate text-sm font-semibold" title={image.filename}>
                      {image.filename}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                      {image.width && image.height ? `${image.width}×${image.height} · ` : ""}
                      {formatBytes(image.byteSize)}
                    </p>
                  </div>
                  <DescriptionEditor id={image.id} alt={image.alt} />
                  <div className="mt-auto flex justify-end">
                    <ConfirmDelete action={deleteMedia.bind(null, image.id)} what="this photo" />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-muted-foreground">
          {files.length} {files.length === 1 ? "PDF" : "PDFs"}
        </h2>
        {files.length === 0 ? (
          <p className="rounded-2xl border border-dashed bg-card p-8 text-center text-sm text-muted-foreground">
            No PDFs yet. Attach one to an award or press item, or drop it above.
          </p>
        ) : (
          <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
            {files.map((file) => (
              <li key={file.id} className="flex items-center gap-4 px-4 py-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 grow">
                  <span className="block truncate text-sm font-semibold">{file.filename}</span>
                  <span className="block text-xs text-muted-foreground">
                    {formatBytes(file.byteSize)}
                  </span>
                </span>
                <a
                  href={mediaUrl(file)!}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-primary"
                  aria-label={`Open ${file.filename}`}
                >
                  <ExternalLink className="size-4" />
                </a>
                <ConfirmDelete action={deleteMedia.bind(null, file.id)} what="this PDF" compact />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
