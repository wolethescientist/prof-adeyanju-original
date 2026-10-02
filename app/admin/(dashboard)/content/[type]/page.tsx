import Link from "next/link";
import { notFound } from "next/navigation";
import { inArray } from "drizzle-orm";
import { ArrowUpRight, CheckCircle2, PenLine, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { db } from "@/db";
import { media } from "@/db/schema";
import { getContentType } from "@/lib/cms/registry";
import { listEntries } from "@/lib/cms/entries";
import { mediaUrl } from "@/lib/cms/media-url";
import { cn } from "@/lib/utils";
import RowActions from "@/app/admin/_components/RowActions";
import { SECTION_ICONS } from "@/app/admin/_components/section-icons";
import {
  deleteEntry,
  moveEntry,
  togglePublished,
} from "@/app/admin/_actions/content";

export default async function ContentListPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ saved?: string; deleted?: string }>;
}) {
  const { type: slug } = await params;
  const { saved, deleted } = await searchParams;

  const type = getContentType(slug);
  if (!type) notFound();

  const rows = await listEntries(type);
  const Icon = SECTION_ICONS[type.icon];

  /* Thumbnails for sections whose entries carry a photo. */
  const imageField = type.fields.find((field) => field.type === "image");
  const imageIds = imageField
    ? rows.map((row) => row[imageField.name]).filter((id): id is string => typeof id === "string")
    : [];
  const thumbs = new Map(
    imageIds.length
      ? (
          await db
            .select({ id: media.id, checksum: media.checksum })
            .from(media)
            .where(inArray(media.id, imageIds))
        ).map((image) => [image.id, image])
      : []
  );

  /* A choice field (who an award went to) adds its label to the subtitle. */
  const choice = type.fields.find((field) => field.type === "choice");

  const singular = type.singular.toLowerCase();
  const visible = rows.filter((row) => row.published).length;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-xl">
          <p className="flex items-center gap-2 font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <Icon className="size-3.5" aria-hidden="true" />
            {type.group}
          </p>
          <h1 className="mt-3 font-heading text-4xl font-medium tracking-tight">{type.label}</h1>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{type.description}</p>
        </div>
        {!type.fixed && (
          <Button
            size="lg"
            className="h-11 shrink-0 px-5 font-bold"
            nativeButton={false}
            render={<Link href={`/admin/content/${slug}/new`} />}
          >
            {type.article ? <PenLine data-icon="inline-start" /> : <Plus data-icon="inline-start" />}
            {type.article ? `Write a new ${singular}` : `Add ${singular}`}
          </Button>
        )}
      </div>

      {(saved || deleted) && (
        <p className="flex items-center gap-2 rounded-xl border border-primary/20 bg-secondary px-4 py-3 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {saved ? "Saved. The website has been updated." : "Deleted."}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card px-6 py-14 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-full bg-secondary text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
          <p className="mt-4 font-heading text-xl font-medium">No {type.label.toLowerCase()} yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first {singular} and it appears on the website as soon as you save.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {!type.fixed && (
            <p className="font-mono text-[0.68rem] font-medium uppercase tracking-[0.16em] text-muted-foreground">
              {rows.length} {rows.length === 1 ? singular : `${singular}s`} · {visible} on the website
              {type.article ? " · shown in this order" : ""}
            </p>
          )}
          <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
            {rows.map((row, index) => {
              const title = String(row[type.titleField] ?? "Untitled");
              const parts = [
                type.subtitleField ? String(row[type.subtitleField] ?? "") : "",
                choice
                  ? choice.options?.find((option) => option.value === row[choice.name])?.label ?? ""
                  : "",
              ].filter(Boolean);
              const thumbId = imageField ? row[imageField.name] : null;
              const thumb = typeof thumbId === "string" ? thumbs.get(thumbId) : undefined;
              const editHref = `/admin/content/${slug}/${row.id}`;
              const liveHref =
                type.article && row.published && typeof row.slug === "string"
                  ? `${type.article.path}/${row.slug}`
                  : null;

              return (
                <li
                  key={row.id}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3.5 transition-colors duration-150 hover:bg-accent/40",
                    !row.published && "bg-muted/40"
                  )}
                >
                  {imageField ? (
                    <Link href={editHref} className="shrink-0" tabIndex={-1} aria-hidden="true">
                      {thumb ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaUrl(thumb)!}
                          alt=""
                          loading="lazy"
                          className={cn(
                            "h-14 w-20 rounded-lg border object-cover object-[50%_22%]",
                            !row.published && "opacity-50 grayscale"
                          )}
                        />
                      ) : (
                        <span className="grid h-14 w-20 place-items-center rounded-lg bg-ink text-gold">
                          <Icon className="size-5" />
                        </span>
                      )}
                    </Link>
                  ) : (
                    !type.fixed && (
                      <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground/70 tabular-nums">
                        {index + 1}
                      </span>
                    )
                  )}

                  <div className="grow min-w-0">
                    <Link
                      href={editHref}
                      className={cn(
                        "block truncate font-semibold hover:text-primary transition-colors",
                        type.article ? "font-heading text-lg font-medium" : "text-sm"
                      )}
                    >
                      {title}
                    </Link>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
                      {parts.length > 0 && <span className="truncate">{parts.join(" · ")}</span>}
                      {!row.published && (
                        <span className="rounded-full bg-muted px-2 py-0.5 font-semibold text-muted-foreground">
                          Hidden
                        </span>
                      )}
                    </p>
                  </div>

                  {liveHref && (
                    <a
                      href={liveHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-primary hover:bg-secondary"
                    >
                      View
                      <ArrowUpRight className="size-3.5" aria-hidden="true" />
                    </a>
                  )}

                  <RowActions
                    fixed={type.fixed}
                    what={singular}
                    editHref={editHref}
                    published={row.published}
                    isFirst={index === 0}
                    isLast={index === rows.length - 1}
                    onMoveUp={moveEntry.bind(null, slug, row.id, "up")}
                    onMoveDown={moveEntry.bind(null, slug, row.id, "down")}
                    onToggle={togglePublished.bind(null, slug, row.id)}
                    onDelete={deleteEntry.bind(null, slug, row.id)}
                  />
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
