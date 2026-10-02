import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getContentType } from "@/lib/cms/registry";
import { listFiles, listImages } from "@/lib/cms/media";
import EntryForm from "@/app/admin/_components/EntryForm";
import { createEntry } from "@/app/admin/_actions/content";

export default async function NewEntryPage({
  params,
}: {
  params: Promise<{ type: string }>;
}) {
  const { type: slug } = await params;
  const type = getContentType(slug);
  /* Fixed sections have exactly the rows the design defines. */
  if (!type || type.fixed) notFound();

  /* Only load the library when the section actually uses it. */
  const usesImages = type.fields.some((field) => field.type === "image" || field.type === "gallery");
  const usesFiles = type.fields.some((field) => field.type === "attachment");
  const [images, files] = await Promise.all([
    usesImages ? listImages() : [],
    usesFiles ? listFiles() : [],
  ]);

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
          {type.article ? `New ${type.singular.toLowerCase()}` : `Add ${type.singular.toLowerCase()}`}
        </h1>
        {type.article && (
          <p className="mt-1.5 text-sm text-muted-foreground">
            Write it as it will appear: the cover photo, the title and summary for its card, then the full story.
          </p>
        )}
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
        action={createEntry.bind(null, slug)}
        images={images}
        files={files}
        submitLabel={type.article ? "Publish" : `Add ${type.singular.toLowerCase()}`}
      />
    </div>
  );
}
