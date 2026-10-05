import { ArrowUpRight, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Attachment, Picture } from "@/app/lib/articles";
import { formatBytes } from "@/app/lib/format";
import { Kicker } from "@/app/components/ui";
import { cn } from "@/lib/utils";
import CopyLink from "./CopyLink";
import { Gallery, LightboxProvider, ZoomableImage } from "./Lightbox";

export type Detail = { label: string; value: React.ReactNode };

/**
 * The page every news item and initiative opens to.
 *
 * It reads like a published piece: a header with the title and summary, the
 * cover photo shown whole, the story with a gallery beneath it, and a side
 * panel with the facts, the PDF and a link to share. Anything the team left
 * empty is simply not shown — no stand-in picture where there is no photo —
 * so an item with only a headline and a date still makes a clean page.
 */
export default function ArticleLayout({
  trail,
  eyebrow,
  title,
  summary,
  details,
  cover,
  body,
  gallery,
  attachment,
  external,
  more,
}: {
  /** Breadcrumb back to where the article is listed. */
  trail: { label: string; href: string }[];
  eyebrow: React.ReactNode;
  title: string;
  summary: string | null;
  details: Detail[];
  cover: Picture | null;
  body: string | null;
  gallery: Picture[];
  attachment: Attachment | null;
  external?: { href: string; label: string } | null;
  more?: { title: string; href: string; linkLabel: string; children: React.ReactNode } | null;
}) {
  const pictures = [...(cover ? [cover] : []), ...gallery];
  const hasStory = Boolean(body) || gallery.length > 0;

  const panel = (
    <>
      {details.length > 0 && (
        <div className="rounded-xl border bg-card p-6">
          <Kicker>Details</Kicker>
          <dl className="mt-4 flex flex-col divide-y">
            {details.map((detail) => (
              <div key={detail.label} className="py-3 first:pt-0 last:pb-0">
                <dt className="text-sm text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-0.5 font-medium leading-snug">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {attachment && (
        <a
          href={attachment.src}
          download={attachment.filename}
          className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
        >
          <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Download the PDF</span>
            <span className="mt-0.5 block truncate text-xs text-muted-foreground">
              {attachment.filename} · {formatBytes(attachment.byteSize)}
            </span>
          </span>
        </a>
      )}

      {external && (
        <a
          href={external.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-3 rounded-xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {external.label}
          <ArrowUpRight
            className="size-4 shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </a>
      )}

      <CopyLink />
    </>
  );

  return (
    <LightboxProvider pictures={pictures}>
      <article>
        <header className="bg-card border-b">
          <div className="mx-auto max-w-6xl px-6 py-10 md:py-12">
            <nav aria-label="Breadcrumb">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {trail.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                    <Link href={crumb.href} className="hover:text-primary transition-colors">
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>
            <div className="mt-6">{eyebrow}</div>
            <h1 className="mt-3 max-w-4xl text-3xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-balance">
              {title}
            </h1>
            {summary && (
              <p className="mt-5 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed">
                {summary}
              </p>
            )}
          </div>
        </header>

        {cover && (
          <div className="mx-auto max-w-6xl px-6 pt-10">
            <ZoomableImage
              picture={cover}
              index={0}
              priority
              sizes="(min-width: 1152px) 1104px, 100vw"
              className="mx-auto"
            />
          </div>
        )}

        <div
          className={cn(
            "mx-auto max-w-6xl px-6 py-12 md:py-14",
            hasStory && "grid gap-12 lg:grid-cols-[minmax(0,1fr)_19rem] lg:gap-16"
          )}
        >
          {hasStory ? (
            <>
              <div className="min-w-0 max-w-[44rem]">
                {body && (
                  <div className="article-body" dangerouslySetInnerHTML={{ __html: body }} />
                )}
                {gallery.length > 0 && (
                  <section className={cn(body && "mt-16")} aria-label="Photos">
                    <Kicker className="mb-4">Photos ({gallery.length})</Kicker>
                    <Gallery pictures={gallery} offset={cover ? 1 : 0} />
                  </section>
                )}
              </div>
              <aside className="flex flex-col gap-4 self-start lg:sticky lg:top-28">{panel}</aside>
            </>
          ) : (
            <aside className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 items-start">{panel}</aside>
          )}
        </div>

        {more && (
          <section className="border-t bg-card py-14">
            <div className="mx-auto max-w-6xl px-6">
              <div>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">{more.title}</h2>
                  <Link
                    href={more.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {more.linkLabel}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </div>
              <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.children}</div>
            </div>
          </section>
        )}
      </article>
    </LightboxProvider>
  );
}
