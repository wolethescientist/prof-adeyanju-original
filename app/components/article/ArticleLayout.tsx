import { ArrowUpRight, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Attachment, Picture } from "@/app/lib/articles";
import { formatBytes } from "@/app/lib/format";
import Reveal from "@/app/components/Reveal";
import { Kicker } from "@/app/components/ui";
import { cn } from "@/lib/utils";
import CopyLink from "./CopyLink";
import { Gallery, LightboxProvider, ZoomableImage } from "./Lightbox";

export type Detail = { label: string; value: React.ReactNode };

/**
 * The page every award, press item and initiative opens to.
 *
 * It reads like a published piece: a header with the title and summary, the
 * cover photo shown whole, the story with a gallery beneath it, and a side
 * panel with the facts, the PDF and a link to share. Anything the team left
 * empty is simply not shown — no stand-in picture where there is no photo —
 * so an award with only a name and a year still makes a clean page.
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
        <div className="rounded-2xl border bg-card p-6">
          <div className="foil -mx-6 -mt-6 mb-5 h-[3px] rounded-t-2xl" aria-hidden="true" />
          <Kicker className="text-gold-ink">Details</Kicker>
          <dl className="mt-4 flex flex-col divide-y">
            {details.map((detail) => (
              <div key={detail.label} className="py-3 first:pt-0 last:pb-0">
                <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {detail.label}
                </dt>
                <dd className="mt-1 font-heading text-lg leading-snug">{detail.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {attachment && (
        <a
          href={attachment.src}
          download={attachment.filename}
          className="group flex items-center gap-4 rounded-2xl border bg-ink p-5 text-white transition-colors hover:bg-[#121b30]"
        >
          <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-white/10">
            <FileText className="size-6 text-[#f3dc9b]" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-sm font-semibold">Download the PDF</span>
            <span className="mt-0.5 block truncate text-xs text-white/60">
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
          className="group flex items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
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
        <header className="relative overflow-hidden bg-card border-b">
          <div className="dotgrid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(195,154,62,0.10),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6 pt-32 pb-12 md:pt-36 md:pb-14">
            <nav aria-label="Breadcrumb" className="animate-fade-up">
              <ol className="flex flex-wrap items-center gap-1.5 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground">
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
            <div className="animate-fade-up mt-7" style={{ animationDelay: "80ms" }}>
              {eyebrow}
            </div>
            <h1
              className="animate-fade-up mt-5 max-w-4xl text-4xl md:text-6xl font-medium tracking-[-0.025em] leading-[1.06] text-balance"
              style={{ animationDelay: "160ms" }}
            >
              {title}
            </h1>
            {summary && (
              <p
                className="animate-fade-up mt-6 max-w-3xl text-lg md:text-xl text-muted-foreground leading-relaxed"
                style={{ animationDelay: "240ms" }}
              >
                {summary}
              </p>
            )}
          </div>
        </header>

        {cover && (
          <div className="mx-auto max-w-6xl px-6 pt-10">
            <div
              className="animate-fade-up overflow-hidden rounded-3xl border bg-ink shadow-[0_30px_70px_rgba(16,24,40,0.16)]"
              style={{ animationDelay: "300ms" }}
            >
              {/* The photo at its own proportions, capped to the screen's
                  height; a tall portrait sits centred on the navy. */}
              <div
                className="relative max-h-[78vh] w-full"
                style={{
                  aspectRatio:
                    cover.width && cover.height ? `${cover.width} / ${cover.height}` : "16 / 9",
                }}
              >
                <ZoomableImage
                  picture={cover}
                  index={0}
                  priority
                  fit="contain"
                  sizes="(min-width: 1152px) 1104px, 100vw"
                  className="h-full"
                />
              </div>
              <div className="foil h-[3px]" aria-hidden="true" />
            </div>
          </div>
        )}

        <div
          className={cn(
            "mx-auto max-w-6xl px-6 py-14 md:py-20",
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
                    <Kicker className="mb-5">
                      Photos · {gallery.length}
                    </Kicker>
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
          <section className="relative border-t bg-card/60 py-16 md:py-20">
            <div className="mx-auto max-w-6xl px-6">
              <Reveal>
                <div className="flex flex-wrap items-end justify-between gap-4">
                  <h2 className="text-3xl md:text-4xl font-medium tracking-[-0.02em]">{more.title}</h2>
                  <Link
                    href={more.href}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline underline-offset-4"
                  >
                    {more.linkLabel}
                    <ArrowUpRight className="size-4" aria-hidden="true" />
                  </Link>
                </div>
              </Reveal>
              <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{more.children}</div>
            </div>
          </section>
        )}
      </article>
    </LightboxProvider>
  );
}
