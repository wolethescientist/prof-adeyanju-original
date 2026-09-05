import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getContentType } from "@/lib/cms/registry";
import { listEntries } from "@/lib/cms/entries";
import ContentTypePicker from "@/app/admin/_components/ContentTypePicker";
import RowActions from "@/app/admin/_components/RowActions";
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

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <ContentTypePicker current={slug} />

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight">{type.label}</h1>
            <p className="mt-1.5 text-sm text-muted-foreground font-medium">
              {type.description}
            </p>
          </div>
          {!type.fixed && (
            <Button
              size="lg"
              className="h-10 font-bold shrink-0"
              nativeButton={false}
              render={<Link href={`/admin/content/${slug}/new`} />}
            >
              <Plus data-icon="inline-start" />
              Add {type.singular.toLowerCase()}
            </Button>
          )}
        </div>
      </div>

      {(saved || deleted) && (
        <p className="flex items-center gap-2 rounded-lg bg-secondary px-3 py-2.5 text-sm font-semibold text-secondary-foreground">
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {saved ? "Saved. The website has been updated." : "Deleted."}
        </p>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed bg-card p-10 text-center">
          <p className="text-sm font-semibold">Nothing here yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add the first {type.singular.toLowerCase()} to see it on the website.
          </p>
        </div>
      ) : (
        <ul className="rounded-xl border bg-card divide-y overflow-hidden">
          {rows.map((row, index) => {
            const title = String(row[type.titleField] ?? "Untitled");
            const subtitle = type.subtitleField
              ? String(row[type.subtitleField] ?? "")
              : "";

            return (
              <li
                key={row.id}
                className="flex items-center gap-4 px-4 py-3.5 hover:bg-accent/40 transition-colors duration-150"
              >
                {!type.fixed && (
                  <span className="w-6 shrink-0 text-xs font-bold tabular-nums text-muted-foreground/70">
                    {index + 1}
                  </span>
                )}

                <div className="grow min-w-0">
                  <p className="text-sm font-semibold truncate">{title}</p>
                  {subtitle && (
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>

                {!row.published && (
                  <Badge variant="secondary" className="shrink-0 text-xs font-bold">
                    Hidden
                  </Badge>
                )}

                <RowActions
                  fixed={type.fixed}
                  what={type.singular.toLowerCase()}
                  editHref={`/admin/content/${slug}/${row.id}`}
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
      )}
    </div>
  );
}
