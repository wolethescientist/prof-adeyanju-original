import { listMedia } from "@/lib/cms/media";
import UploadForm from "@/app/admin/_components/UploadForm";
import ConfirmDelete from "@/app/admin/_components/ConfirmDelete";
import { deleteMedia } from "@/app/admin/_actions/media";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function MediaPage() {
  const images = await listMedia();

  return (
    <div className="flex flex-col gap-8">
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold tracking-tight">Images</h1>
        <p className="mt-1.5 text-sm text-muted-foreground font-medium">
          Upload photos of awards, events and press. Once an image is here you
          can attach it to an award, an initiative or a press item.
        </p>
      </div>

      <div className="max-w-lg">
        <UploadForm />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          {images.length} {images.length === 1 ? "image" : "images"}
        </h2>

        {images.length === 0 ? (
          <div className="rounded-xl border border-dashed bg-card p-10 text-center">
            <p className="text-sm font-semibold">No images yet.</p>
          </div>
        ) : (
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <li
                key={image.id}
                className="rounded-xl border bg-card overflow-hidden flex flex-col"
              >
                {/* Plain <img>: these are admin thumbnails of arbitrary
                    uploads, not layout-critical page imagery. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/api/media/${image.id}?v=${image.checksum.slice(0, 12)}`}
                  alt={image.alt}
                  className="h-40 w-full object-cover bg-muted"
                  loading="lazy"
                />
                <div className="p-4 flex flex-col gap-1 grow">
                  <p className="text-sm font-semibold truncate" title={image.filename}>
                    {image.filename}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {image.alt}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground/80 tabular-nums">
                    {image.width && image.height
                      ? `${image.width}×${image.height} · `
                      : ""}
                    {formatSize(image.byteSize)}
                  </p>
                  <div className="mt-auto pt-3 flex justify-end">
                    <ConfirmDelete
                      action={deleteMedia.bind(null, image.id)}
                      what="this image"
                    />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
