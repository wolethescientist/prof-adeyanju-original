import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContentType } from "@/lib/cms/registry";
import { getEntry } from "@/lib/cms/entries";
import { listFiles, listImages } from "@/lib/cms/media";
import EntryForm from "@/app/admin/_components/EntryForm";
import ConfirmDelete from "@/app/admin/_components/ConfirmDelete";
import { deleteEntry, updateEntry } from "@/app/admin/_actions/content";

export default async function EditEntryPage({
  params,
}: {
  params: Promise<{ type: string; id: string }>;
}) {
  const { type: slug, id } = await params;

  const type = getContentType(slug);
  if (!type) notFound();

  /* A malformed id would make Postgres throw rather than find nothing. */
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)) notFound();
  const entry = await getEntry(type, id);
  if (!entry) notFound();

  const usesImages = type.fields.some((field) => field.type === "image" || field.type === "gallery");
  const usesFiles = type.fields.some((field) => field.type === "attachment");
  const [images, files] = await Promise.all([
    usesImages ? listImages() : [],
    usesFiles ? listFiles() : [],
  ]);

  const viewHref =
    type.article && entry.published && typeof entry.slug === "string"
      ? `${type.article.path}/${entry.slug}`
      : null;

  return (
    <div className={type.article ? "flex flex-col gap-7" : "flex flex-col gap-7 max-w-2xl"}>
      <div>
        <Link
          href={`/admin/content/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-150"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {type.label}
        </Link>
        <h1 className="mt-4 font-heading text-3xl font-medium tracking-tight">
          Edit {type.singular.toLowerCase()}
        </h1>
      </div>

      <EntryForm
        spec={{
          slug: type.slug,
          label: type.label,
          singular: type.singular,
          fields: type.fields,
          titleField: type.titleField,
          article: Boolean(type.article),
        }}
        action={updateEntry.bind(null, slug, id)}
        initial={entry}
        images={images}
        files={files}
        submitLabel="Save changes"
        viewHref={viewHref}
      />

      {!type.fixed && (
        <div className="border-t pt-6">
          <ConfirmDelete
            action={deleteEntry.bind(null, slug, id)}
            what={`this ${type.singular.toLowerCase()}`}
          />
        </div>
      )}
    </div>
  );
}
