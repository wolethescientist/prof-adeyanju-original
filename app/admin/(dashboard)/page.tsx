import Link from "next/link";
import { ArrowRight, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTENT_TYPES } from "@/lib/cms/registry";
import { countEntries } from "@/lib/cms/entries";
import { listMedia } from "@/lib/cms/media";
import { getCurrentUser } from "@/lib/auth/session";
import ContentTypePicker from "@/app/admin/_components/ContentTypePicker";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [counts, images] = await Promise.all([
    Promise.all(
      CONTENT_TYPES.map(async (type) => ({
        type,
        ...(await countEntries(type)),
      }))
    ),
    listMedia(),
  ]);

  const groups = [...new Set(CONTENT_TYPES.map((type) => type.group))];
  const firstName = user?.name.split(" ")[0] ?? "there";

  return (
    <div className="flex flex-col gap-9">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {firstName}.
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground font-medium">
          Choose a section to add or edit content. Changes appear on the website
          as soon as you save.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <ContentTypePicker />
        <Button
          variant="outline"
          size="lg"
          className="h-10 font-semibold bg-card"
          nativeButton={false}
          render={<Link href="/admin/media" />}
        >
          <ImagePlus data-icon="inline-start" />
          Upload an image
        </Button>
      </div>

      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-3">
          <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {group}
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {counts
              .filter((entry) => entry.type.group === group)
              .map(({ type, total, published }) => (
                <Link
                  key={type.slug}
                  href={`/admin/content/${type.slug}`}
                  className="group rounded-xl border bg-card p-5 transition-colors duration-150 hover:border-primary/40 hover:bg-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-bold group-hover:text-primary transition-colors duration-150">
                      {type.label}
                    </h3>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </div>
                  <p className="mt-3 text-2xl font-bold tabular-nums">{total}</p>
                  <p className="mt-0.5 text-xs font-medium text-muted-foreground">
                    {total === published
                      ? `${total === 1 ? "entry" : "entries"}, all visible`
                      : `${published} visible · ${total - published} hidden`}
                  </p>
                </Link>
              ))}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-3">
        <h2 className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
          Images
        </h2>
        <Link
          href="/admin/media"
          className="group rounded-xl border bg-card p-5 transition-colors duration-150 hover:border-primary/40 hover:bg-accent/40 sm:max-w-xs"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-bold group-hover:text-primary transition-colors duration-150">
              Image library
            </h3>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-transform duration-150 group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </div>
          <p className="mt-3 text-2xl font-bold tabular-nums">{images.length}</p>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {images.length === 1 ? "image" : "images"} uploaded
          </p>
        </Link>
      </section>
    </div>
  );
}
