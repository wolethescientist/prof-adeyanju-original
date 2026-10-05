import { ArrowUpRight, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import type { Attachment, Picture } from "@/app/lib/articles";
import { formatBytes } from "@/app/lib/format";
import { cn } from "@/lib/utils";
import Reveal from "../Reveal";
import CopyLink from "./CopyLink";
import { Gallery, LightboxProvider, ZoomableImage } from "./Lightbox";

export type Detail = { label: string; value: React.ReactNode };

const action =
  "inline-flex h-11 items-center gap-2 rounded-lg px-5 text-sm font-semibold transition-colors";

/**
 * The page every news item and initiative opens to.
 *
 * It reads like a published piece. The header carries everything a visitor
 * wants first: the headline, the summary, the key facts, and the PDF, the
 * original link and a share button. A tall portrait sits beside the headline;
 * a wide photo runs across the top. The story follows in a single column set
 * for comfortable reading, then the gallery. Anything the team left empty is
 * simply not shown — no stand-in picture where there is no photo — so an item
 * with only a headline and a date still makes a clean page.
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
  /* The cover always sits at the top. A wide photo runs above the headline;
     a square or tall one (a portrait, a logo) sits beside it, and above it on
     a phone, so it is seen whole without pushing the story down the page. */
  const ratio = cover?.width && cover?.height ? cover.width / cover.height : 1.6;
  const wide = Boolean(cover) && ratio >= 1.4;
  const beside = Boolean(cover) && !wide;
  const coverLook =
    "overflow-hidden rounded-2xl shadow-[0_24px_60px_-20px_rgba(16,24,40,0.35)] ring-1 ring-black/5";

  return (
    <LightboxProvider pictures={pictures}>
      <article>
        <header className="relative overflow-hidden border-b bg-card">
          <div className="dotgrid absolute inset-0" aria-hidden="true" />
          <div
            className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.10),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6 py-10 md:py-14">
            <nav aria-label="Breadcrumb" className="animate-fade-up">
              <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
                {trail.map((crumb, i) => (
                  <li key={crumb.href} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight className="size-3" aria-hidden="true" />}
                    <Link href={crumb.href} className="transition-colors hover:text-primary">
                      {crumb.label}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            {wide && cover && (
              <ZoomableImage
                picture={cover}
                index={0}
                priority
                sizes="(min-width: 1152px) 1104px, 100vw"
                className={cn("animate-fade-up mx-auto mt-8", coverLook)}
              />
            )}

            <div
              className={cn(
                "mt-8",
                beside && "grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-center lg:gap-14"
              )}
            >
              <div>
                <div
                  className="animate-fade-up flex flex-wrap items-center gap-x-3 gap-y-2"
                  style={{ animationDelay: "80ms" }}
                >
                  {eyebrow}
                </div>
                <h1
                  className="animate-fade-up mt-5 max-w-4xl text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-balance md:text-6xl"
                  style={{ animationDelay: "160ms" }}
                >
                  {title}
                </h1>
                {summary && (
                  <p
                    className="animate-fade-up mt-6 max-w-2xl text-xl leading-relaxed text-muted-foreground text-pretty md:text-[1.35rem]"
                    style={{ animationDelay: "240ms" }}
                  >
                    {summary}
                  </p>
                )}

                {details.length > 0 && (
                  <dl
                    className="animate-fade-up mt-8 flex flex-wrap gap-x-12 gap-y-5 border-t pt-6"
                    style={{ animationDelay: "320ms" }}
                  >
                    {details.map((detail) => (
                      <div key={detail.label}>
                        <dt className="text-sm text-muted-foreground">{detail.label}</dt>
                        <dd className="mt-1 text-base font-semibold leading-snug">{detail.value}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                <div
                  className="animate-fade-up mt-8 flex flex-wrap gap-3"
                  style={{ animationDelay: "400ms" }}
                >
                  {external && (
                    <a
                      href={external.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(action, "group bg-primary text-primary-foreground hover:bg-primary/90")}
                    >
                      {external.label}
                      <ArrowUpRight
                        className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                        aria-hidden="true"
                      />
                    </a>
                  )}
                  {attachment && (
                    <a
                      href={attachment.src}
                      download={attachment.filename}
                      className={cn(action, "border bg-card hover:border-primary/40 hover:text-primary")}
                    >
                      <FileText className="size-4" aria-hidden="true" />
                      Download PDF
                      <span className="font-normal text-muted-foreground">
                        {formatBytes(attachment.byteSize)}
                      </span>
                    </a>
                  )}
                  <CopyLink />
                </div>
              </div>

              {beside && cover && (
                <ZoomableImage
                  picture={cover}
                  index={0}
                  priority
                  sizes="(min-width: 1024px) 384px, 100vw"
                  className={cn(
                    "animate-fade-up order-first mx-auto w-full max-w-md lg:order-none lg:mx-0 lg:justify-self-end",
                    coverLook
                  )}
                />
              )}
            </div>
          </div>
        </header>

        {(body || gallery.length > 0) && (
          <div className="mx-auto max-w-6xl px-6 py-14 md:py-20">
            {body && (
              <div
                className="article-body mx-auto max-w-[42rem]"
                dangerouslySetInnerHTML={{ __html: body }}
              />
            )}
            {gallery.length > 0 && (
              <section className={cn("animate-fade-up", body && "mt-20")} aria-label="Photos">
                <h2 className="mb-6 text-2xl font-semibold tracking-tight">
                  Photos
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    {gallery.length}
                  </span>
                </h2>
                <Gallery pictures={gallery} offset={cover ? 1 : 0} />
              </section>
            )}
          </div>
        )}

        {more && (
          <section className={cn("border-t bg-card py-14 md:py-16", (body || gallery.length > 0) && "mt-6")}>
            <div className="mx-auto max-w-6xl px-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">{more.title}</h2>
                <Link
                  href={more.href}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline"
                >
                  {more.linkLabel}
                  <ArrowUpRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <Reveal>
                <div className="mt-8 grid items-start gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {more.children}
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </article>
    </LightboxProvider>
  );
}
