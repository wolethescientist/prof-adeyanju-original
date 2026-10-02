import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type {
  AwardCard as Award,
  InitiativeCard as Initiative,
  Picture,
  PressCard as Press,
} from "@/app/lib/articles";
import { formatDate } from "@/app/lib/format";
import { resolveIcon } from "@/app/lib/icons";
import { cn } from "@/lib/utils";
import Seal, { RECIPIENT_NAME } from "./Seal";

const card =
  "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-[box-shadow,transform] duration-300 hover:-translate-y-1 hover:shadow-[0_22px_45px_rgba(16,24,40,0.12)] focus-within:shadow-[0_22px_45px_rgba(16,24,40,0.12)]";

/* The whole card is one link; the title carries it, stretched over the card. */
const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

/**
 * A card's photo, shown whole — never cropped — on the navy ground, so a
 * portrait of someone holding an award keeps their face and the plaque.
 * Entries without a photo simply have no picture area.
 */
function Photo({
  picture,
  sizes,
  className,
  children,
}: {
  picture: Picture;
  sizes: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden bg-ink", className)}>
      <Image
        src={picture.src}
        alt={picture.alt}
        fill
        sizes={sizes}
        className="object-contain transition-transform duration-700 ease-out group-hover:scale-[1.02]"
      />
      {children}
    </div>
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

export function AwardCard({
  award,
  featured = false,
}: {
  award: Award;
  /** The lead award on the page: wider, with any photo beside the text. */
  featured?: boolean;
}) {
  const photo = award.cover;
  const wide = featured && photo;

  return (
    <article className={cn(card, wide && "lg:flex-row")}>
      {photo ? (
        <>
          <Photo
            picture={photo}
            sizes={wide ? "(min-width: 1024px) 620px, 100vw" : "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"}
            className={wide ? "aspect-[4/3] lg:aspect-auto lg:w-[55%] lg:shrink-0 lg:min-h-[26rem]" : "aspect-[4/3]"}
          >
            <Seal recipient={award.recipient} className="absolute top-4 left-4" />
          </Photo>
          <div className={cn("h-[3px] foil shrink-0", wide && "lg:h-auto lg:w-[3px]")} />
        </>
      ) : (
        <div className="h-[3px] foil shrink-0" />
      )}

      <div className={cn("flex grow flex-col p-6", featured && "md:p-10", wide && "lg:justify-center")}>
        <div className="flex items-center gap-3">
          {!photo && <Seal recipient={award.recipient} className="size-10" />}
          <p className="font-mono text-[0.7rem] font-medium uppercase tracking-[0.16em] text-gold-ink">
            {award.year} · {RECIPIENT_NAME[award.recipient]}
          </p>
        </div>
        <h3
          className={cn(
            "mt-4 font-heading font-medium leading-snug tracking-[-0.01em] text-balance",
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
              featured ? "max-w-2xl text-base md:text-lg line-clamp-4" : "text-sm line-clamp-3"
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
        <ReadMore className={wide ? "lg:mt-4" : undefined}>Read the story</ReadMore>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------------- press */

export function PressCard({ item }: { item: Press }) {
  const date = formatDate(item.publishedOn);
  return (
    <article className={card}>
      {item.cover && (
        <Photo
          picture={item.cover}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10] border-b"
        />
      )}
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
      {item.cover && (
        <Photo
          picture={item.cover}
          sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
          className="aspect-[16/10]"
        />
      )}
      <div className="flex grow flex-col p-6">
        {!item.cover && (
          <span className="mb-5 grid size-10 place-items-center rounded-xl bg-secondary text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
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
