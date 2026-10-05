import Link from "next/link";
import { count, desc, inArray } from "drizzle-orm";
import { ArrowRight, ClipboardList, FolderOpen, PenLine } from "lucide-react";
import { db } from "@/db";
import { eventRegistrations, media } from "@/db/schema";
import { CONTENT_TYPES } from "@/lib/cms/registry";
import { countEntries } from "@/lib/cms/entries";
import { listMedia } from "@/lib/cms/media";
import { mediaUrl } from "@/lib/cms/media-url";
import { getCurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";
import { SECTION_ICONS } from "@/app/admin/_components/section-icons";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyTable = any;

/** The most recently edited articles across news and initiatives. */
async function recentStories(limit = 5) {
  const articleTypes = CONTENT_TYPES.filter((type) => type.article);
  const batches = await Promise.all(
    articleTypes.map(async (type) => {
      const table = type.table as AnyTable;
      const rows = (await db
        .select()
        .from(table)
        .orderBy(desc(table.updatedAt))
        .limit(limit)) as Record<string, unknown>[];
      return rows.map((row) => ({
        type,
        id: String(row.id),
        title: String(row[type.titleField] ?? "Untitled"),
        imageId: typeof row.imageId === "string" ? row.imageId : null,
        published: Boolean(row.published),
        updatedAt: row.updatedAt as Date,
      }));
    })
  );
  const stories = batches
    .flat()
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, limit);

  const ids = stories.map((story) => story.imageId).filter((id): id is string => Boolean(id));
  const thumbs = new Map(
    ids.length
      ? (
          await db
            .select({ id: media.id, checksum: media.checksum })
            .from(media)
            .where(inArray(media.id, ids))
        ).map((image) => [image.id, image])
      : []
  );
  return stories.map((story) => ({
    ...story,
    thumb: story.imageId ? thumbs.get(story.imageId) ?? null : null,
  }));
}

function ago(date: Date) {
  const minutes = Math.round((Date.now() - date.getTime()) / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
  const days = Math.round(hours / 24);
  if (days < 30) return `${days} ${days === 1 ? "day" : "days"} ago`;
  return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default async function DashboardPage() {
  const user = await getCurrentUser();

  const [counts, library, stories, [{ registered }]] = await Promise.all([
    Promise.all(
      CONTENT_TYPES.map(async (type) => ({
        type,
        ...(await countEntries(type)),
      }))
    ),
    listMedia(),
    recentStories(),
    db.select({ registered: count() }).from(eventRegistrations),
  ]);

  const groups = [...new Set(CONTENT_TYPES.map((type) => type.group))];
  /* A person's first name; a shared team account ("Galaxy Backbone Media
     Team") is just welcomed back. */
  const words = user?.name.trim().split(/\s+/) ?? [];
  const firstName = words.length > 0 && words.length <= 2 ? words[0] : null;
  const articleTypes = CONTENT_TYPES.filter((type) => type.article);
  const photos = library.filter((item) => item.mimeType.startsWith("image/")).length;
  const pdfs = library.length - photos;

  return (
    <div className="flex flex-col gap-12">
      <div>
        <p className="text-xs font-medium text-muted-foreground">
          Site manager
        </p>
        <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
          Welcome back{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          Post an award, an invitation or a piece of news, or update any part of the
          website. Everything you save appears on the site straight away.
        </p>
      </div>

      <section aria-labelledby="write" className="flex flex-col gap-4">
        <h2 id="write" className="text-xs font-medium text-muted-foreground">
          Write something new
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {articleTypes.map((type, i) => {
            const Icon = SECTION_ICONS[type.icon];
            return (
              <Link
                key={type.slug}
                href={`/admin/content/${type.slug}/new`}
                className={cn(
                  "group relative flex flex-col rounded-xl border p-5 transition-colors hover:border-primary/60",
                  i === 0 ? "bg-primary text-primary-foreground border-primary" : "bg-card"
                )}
              >
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-lg",
                    i === 0 ? "bg-white/15" : "bg-secondary text-primary"
                  )}
                >
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <span className="mt-5 text-lg font-semibold">
                  {type.slug === "news" ? "Post an update" : `New ${type.singular.toLowerCase()}`}
                </span>
                <span className={cn("mt-1 text-sm", i === 0 ? "text-primary-foreground/85" : "text-muted-foreground")}>
                  {type.slug === "news"
                    ? "An award, an invitation or lecture, press coverage or other news"
                    : "A programme at Galaxy Backbone"}
                </span>
                <PenLine
                  className={cn(
                    "absolute right-5 top-5 size-4",
                    i === 0 ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}
                  aria-hidden="true"
                />
              </Link>
            );
          })}
        </div>
      </section>

      {stories.length > 0 && (
        <section aria-labelledby="recent" className="flex flex-col gap-4">
          <h2 id="recent" className="text-xs font-medium text-muted-foreground">
            Recently edited
          </h2>
          <ul className="overflow-hidden rounded-2xl border bg-card divide-y">
            {stories.map((story) => {
              const Icon = SECTION_ICONS[story.type.icon];
              return (
                <li key={`${story.type.slug}-${story.id}`}>
                  <Link
                    href={`/admin/content/${story.type.slug}/${story.id}`}
                    className="group flex items-center gap-4 px-4 py-3 hover:bg-accent/40 transition-colors"
                  >
                    {story.thumb ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={mediaUrl(story.thumb)!}
                        alt=""
                        className="h-12 w-16 shrink-0 rounded-lg border object-cover object-[50%_22%]"
                      />
                    ) : (
                      <span className="grid h-12 w-16 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                        <Icon className="size-4" aria-hidden="true" />
                      </span>
                    )}
                    <span className="min-w-0 grow">
                      <span className="block truncate text-base font-semibold leading-snug group-hover:text-primary transition-colors">
                        {story.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {story.type.singular} · edited {ago(story.updatedAt)}
                        {!story.published && " · hidden"}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {groups.map((group) => (
        <section key={group} className="flex flex-col gap-4">
          <h2 className="text-xs font-medium text-muted-foreground">
            {group}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {counts
              .filter((entry) => entry.type.group === group)
              .map(({ type, total, published }) => {
                const Icon = SECTION_ICONS[type.icon];
                return (
                  <Link
                    key={type.slug}
                    href={`/admin/content/${type.slug}`}
                    className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors duration-150 hover:border-primary/40"
                  >
                    <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 grow">
                      <span className="block truncate text-sm font-semibold group-hover:text-primary transition-colors">
                        {type.label}
                      </span>
                      <span className="block text-xs text-muted-foreground">
                        {total === published
                          ? `${total} ${total === 1 ? "entry" : "entries"}`
                          : `${published} shown · ${total - published} hidden`}
                      </span>
                    </span>
                    <ArrowRight
                      className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
          </div>
        </section>
      ))}

      <section className="flex flex-col gap-4">
        <h2 className="text-xs font-medium text-muted-foreground">
          Library and events
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <Link
            href="/admin/media"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors duration-150 hover:border-primary/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <FolderOpen className="size-5" aria-hidden="true" />
            </span>
            <span className="grow">
              <span className="block text-sm font-semibold group-hover:text-primary transition-colors">
                Photos &amp; PDFs
              </span>
              <span className="block text-xs text-muted-foreground">
                {photos} {photos === 1 ? "photo" : "photos"} · {pdfs} {pdfs === 1 ? "PDF" : "PDFs"}
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
          <Link
            href="/admin/registrations"
            className="group flex items-center gap-4 rounded-2xl border bg-card p-4 transition-colors duration-150 hover:border-primary/40"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-secondary text-primary">
              <ClipboardList className="size-5" aria-hidden="true" />
            </span>
            <span className="grow">
              <span className="block text-sm font-semibold group-hover:text-primary transition-colors">
                Registrations
              </span>
              <span className="block text-xs text-muted-foreground">
                {registered} {registered === 1 ? "person" : "people"} registered
              </span>
            </span>
            <ArrowRight
              className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
              aria-hidden="true"
            />
          </Link>
        </div>
      </section>
    </div>
  );
}
