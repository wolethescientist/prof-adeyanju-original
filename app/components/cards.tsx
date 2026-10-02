import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { AwardCard as Award, InitiativeCard as Initiative, PressCard as Press } from "@/app/lib/articles";
import { formatDate } from "@/app/lib/format";
import { resolveIcon } from "@/app/lib/icons";
import { cn } from "@/lib/utils";
import Laurel from "./Laurel";
import Seal, { RECIPIENT_NAME } from "./Seal";

const card =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(16,24,40,0.12)] focus-within:shadow-[0_22px_45px_rgba(16,24,40,0.12)]";

/* The whole card is one link; the title carries it, stretched over the card. */
const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

function Cover({
  src,
  alt,
  sizes,
}: {
  src: string;
  alt: string;
  sizes: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      className="object-cover object-[50%_22%] transition-transform duration-700 ease-out group-hover:scale-[1.04]"
    />
  );
}

function ReadMore({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn("mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-primary", className)}>
      {children}
      <ArrowRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </span>
  );
}

/* ------------------------------------------------------------------ awards */

/**
 * What an award shows when it has no photograph: a navy plate with the year
 * set inside a gold laurel, like the face of the award itself.
 */
export function AwardPlate({
  year,
  awardedBy,
  large = false,
}: {
  year: string;
  awardedBy?: string | null;
  large?: boolean;
}) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(195,154,62,0.22),transparent_62%)]"
        aria-hidden="true"
      />
      <div
        className="absolute inset-0 opacity-[0.07] bg-[repeating-linear-gradient(135deg,#fff_0_1px,transparent_1px_9px)]"
        aria-hidden="true"
      />
      <div className="relative grid place-items-center">
        <Laurel className={cn("text-gold/85", large ? "size-60" : "size-40")} />
        <span
          className={cn(
            "absolute font-heading font-medium tracking-tight bg-gradient-to-b from-[#f7e6b4] via-[#d9b45c] to-[#a37a24] bg-clip-text text-transparent",
            large ? "text-6xl" : "text-[2.35rem]"
          )}
        >
          {year}
        </span>
      </div>
      {awardedBy && (
        <p className="absolute bottom-4 inset-x-6 truncate text-center font-mono text-[0.65rem] uppercase tracking-[0.18em] text-white/55">
          {awardedBy}
        </p>
      )}
    </div>
  );
}

export function AwardCard({
  award,
  featured = false,
}: {
  award: Award;
  /** The lead award on the page: wider, with the photo beside the text. */
  featured?: boolean;
}) {
  return (
    <article className={cn(card, featured && "lg:flex-row")}>
      <div
        className={cn(
          "relative overflow-hidden bg-ink",
          featured ? "aspect-[16/10] lg:aspect-auto lg:w-[55%] lg:shrink-0 lg:min-h-[24rem]" : "aspect-[4/3]"
        )}
      >
        {award.cover ? (
          <Cover
            src={award.cover.src}
            alt={award.cover.alt}
            sizes={featured ? "(min-width: 1024px) 640px, 100vw" : "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"}
          />
        ) : (
          <AwardPlate year={award.year} awardedBy={award.awardedBy} large={featured} />
        )}
        <Seal recipient={award.recipient} className="absolute top-4 left-4" />
      </div>

      <div className={cn("h-[3px] foil shrink-0", featured && "lg:h-auto lg:w-[3px]")} />

      <div className={cn("flex grow flex-col p-6", featured && "lg:p-10 lg:justify-center")}>
        <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-gold-ink">
          {award.year} · {RECIPIENT_NAME[award.recipient]}
        </p>
        <h3
          className={cn(
            "mt-3 font-heading font-medium leading-snug tracking-[-0.01em] text-balance",
            featured ? "text-3xl md:text-[2.4rem] leading-[1.12]" : "text-[1.35rem]"
          )}
        >
          <Link href={award.href} className={stretched}>
            {award.title}
          </Link>
        </h3>
        {award.summary && (
          <p
            className={cn(
              "mt-3 text-muted-foreground leading-relaxed",
              featured ? "text-base md:text-lg line-clamp-4" : "text-sm line-clamp-3"
            )}
          >
            {award.summary}
          </p>
        )}
        {featured && award.awardedBy && (
          <p className="mt-4 text-sm text-muted-foreground">
            Presented by <span className="font-semibold text-foreground">{award.awardedBy}</span>
          </p>
        )}
        {/* Beside a tall photo, the link stays with the text rather than the card's foot. */}
        <ReadMore className={featured ? "lg:mt-4" : undefined}>Read the story</ReadMore>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- press */

/** A press item without a photo shows the publication's name as a masthead. */
function Masthead({ outlet }: { outlet: string }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-[#f7f8fb] px-6">
      <div className="absolute inset-x-6 top-5 border-t-2 border-foreground/80" aria-hidden="true" />
      <div className="absolute inset-x-6 top-7 border-t border-foreground/30" aria-hidden="true" />
      <p className="font-heading text-[2rem] font-semibold italic tracking-tight text-foreground/85 text-center leading-none">
        {outlet}
      </p>
      <div className="absolute inset-x-6 bottom-6 flex flex-col gap-1.5" aria-hidden="true">
        <span className="h-1.5 w-full rounded-full bg-foreground/[0.07]" />
        <span className="h-1.5 w-4/5 rounded-full bg-foreground/[0.07]" />
        <span className="h-1.5 w-3/5 rounded-full bg-foreground/[0.07]" />
      </div>
    </div>
  );
}

export function PressCard({ item }: { item: Press }) {
  const date = formatDate(item.publishedOn);
  return (
    <article className={card}>
      <div className="relative aspect-[16/10] overflow-hidden border-b">
        {item.cover ? (
          <Cover
            src={item.cover.src}
            alt={item.cover.alt}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <Masthead outlet={item.outlet} />
        )}
      </div>
      <div className="flex grow flex-col p-6">
        <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-primary">
          {item.outlet}
          {date && <span className="text-muted-foreground"> · {date}</span>}
        </p>
        <h3 className="mt-3 font-heading text-[1.3rem] font-medium leading-snug tracking-[-0.01em] text-balance">
          <Link href={item.href} className={stretched}>
            {item.title}
          </Link>
        </h3>
        {item.summary && (
          <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-3">
            {item.summary}
          </p>
        )}
        <ReadMore>Read more</ReadMore>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------- initiatives */

export function InitiativeCard({ item }: { item: Initiative }) {
  const Icon = resolveIcon(item.icon);
  return (
    <article className={card}>
      <div className="relative aspect-[16/10] overflow-hidden bg-ink">
        {item.cover ? (
          <Cover
            src={item.cover.src}
            alt={item.cover.alt}
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center">
            <div
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(29,78,216,0.55),transparent_60%),radial-gradient(ellipse_at_80%_90%,rgba(14,165,233,0.25),transparent_55%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 opacity-25 bg-[radial-gradient(rgba(255,255,255,0.5)_1px,transparent_1.5px)] [background-size:18px_18px]"
              aria-hidden="true"
            />
            <span className="relative grid size-20 place-items-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
              <Icon className="size-9 text-white" aria-hidden="true" />
            </span>
          </div>
        )}
      </div>
      <div className="flex grow flex-col p-6">
        <h3 className="font-heading text-[1.4rem] font-medium leading-snug tracking-[-0.01em]">
          <Link href={item.href} className={stretched}>
            {item.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
          {item.summary}
        </p>
        <ReadMore>Explore the initiative</ReadMore>
      </div>
    </article>
  );
}
