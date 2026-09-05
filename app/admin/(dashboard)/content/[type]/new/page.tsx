import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContentType } from "@/lib/cms/registry";
import { listMedia } from "@/lib/cms/media";
import EntryForm from "@/app/admin/_components/EntryForm";
import { createEntry } from "@/app/admin/_actions/content";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const type = getContentType(slug);
  if (!type) notFound();

  /* Only load the image library when the section actually uses one. */
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
          Add {type.singular.toLowerCase()}
        </h1>
      </div>

      <EntryForm
        spec={{
          slug: type.slug,
          label: type.label,
          singular: type.singular,
          fields: type.fields,
        }}
        action={createEntry.bind(null, slug)}
        images={images}
        submitLabel={`Add ${type.singular.toLowerCase()}`}
      />
    </div>
  );
}
