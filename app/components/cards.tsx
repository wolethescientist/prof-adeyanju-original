import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { InitiativeCard as Initiative, Picture } from "@/app/lib/articles";
import type { NewsCard as News } from "@/app/lib/news";
import { resolveIcon } from "@/app/lib/icons";
import { NEWS_CATEGORY_INFO } from "@/lib/cms/news";
import { cn } from "@/lib/utils";

const card =
  "group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-[border-color,box-shadow,transform] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-[0_22px_45px_rgba(16,24,40,0.12)] focus-within:border-primary/30";

/* The whole card is one link; the title carries it, stretched over the card. */
const stretched = "after:absolute after:inset-0 after:content-[''] focus-visible:outline-none";

/**
 * A card's photo: the whole picture at its own proportions, with nothing
 * behind it and nothing laid over it. A tall portrait is capped in height
 * rather than cropped. Entries without a photo have no picture area.
 */
function Photo({ picture, sizes }: { picture: Picture; sizes: string }) {
  return (
    <Image
      src={picture.src}
      alt={picture.alt}
      width={picture.width ?? 1200}
      height={picture.height ?? 800}
      sizes={sizes}
      className="mx-auto h-auto max-h-80 w-auto max-w-full"
    />
  );
}

const photoSizes = "(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw";

function ReadMore({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-auto inline-flex items-center gap-1.5 pt-5 text-sm font-semibold text-primary">
      {children}
      <ArrowRight
        className="size-4 transition-transform duration-200 group-hover:translate-x-1"
        aria-hidden="true"
      />
    </span>
  );
}

/** "New" on anything posted in the last two weeks. */
export function NewTag({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "rounded bg-primary px-1.5 py-0.5 text-[0.7rem] font-bold leading-none text-primary-foreground",
        className
      )}
    >
      New
    </span>
  );
}

/* -------------------------------------------------------------------- news */

export function NewsCard({ item }: { item: News }) {
  return (
    <article className={card}>
      {item.cover && <Photo picture={item.cover} sizes={photoSizes} />}
      <div className="flex grow flex-col p-6">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-muted-foreground">
          <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[0.8rem] font-semibold text-secondary-foreground">
            {NEWS_CATEGORY_INFO[item.category].label}
          </span>
          {item.when && <span>{item.when}</span>}
          {item.isNew && <NewTag />}
        </p>
        <h3 className="mt-3 text-xl font-semibold leading-snug tracking-[-0.015em] text-balance">
          <Link href={item.href} className={stretched}>
            {item.title}
          </Link>
        </h3>
        {item.source && <p className="mt-1 text-sm text-muted-foreground">{item.source}</p>}
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
      {item.cover && <Photo picture={item.cover} sizes={photoSizes} />}
      <div className="flex grow flex-col p-6">
        {!item.cover && (
          <span className="mb-4 grid size-10 place-items-center rounded-lg bg-secondary text-primary">
            <Icon className="size-5" aria-hidden="true" />
          </span>
        )}
        <h3 className="text-xl font-semibold leading-snug tracking-tight">
          <Link href={item.href} className={stretched}>
            {item.title}
          </Link>
        </h3>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed line-clamp-4">
          {item.summary}
        </p>
        <ReadMore>Read more</ReadMore>
      </div>
    </article>
  );
}
