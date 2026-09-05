import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContentType } from "@/lib/cms/registry";
import { getEntry } from "@/lib/cms/entries";
import { listMedia } from "@/lib/cms/media";
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

  const entry = await getEntry(type, id);
  if (!entry) notFound();

  const needsImages = type.fields.some((field) => field.type === "image");
  const images = needsImages ? await listMedia() : [];

  return (
    <div className="flex flex-col gap-7 max-w-2xl">
      <div>
        <Link
          href={`/admin/content/${slug}`}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors duration-150"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {type.label}
        </Link>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">
          Edit {type.singular.toLowerCase()}
        </h1>
      </div>

      <EntryForm
        spec={{
          slug: type.slug,
          label: type.label,
          singular: type.singular,
          fields: type.fields,
        }}
        action={updateEntry.bind(null, slug, id)}
        initial={entry}
        images={images}
        submitLabel="Save changes"
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
