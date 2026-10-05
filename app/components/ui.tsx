import { cn } from "@/lib/utils";

/** The small label above a heading: what kind of thing follows. */
export function Kicker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={cn("text-sm font-semibold text-primary", className)}>{children}</p>;
}

export function SectionHeading({
  kicker,
  title,
  intro,
  className,
}: {
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      {kicker && <Kicker className="mb-2">{kicker}</Kicker>}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-balance">{title}</h2>
      {intro && <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{intro}</p>}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  /** Anything that belongs under the intro — figures, filters, links. */
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-card border-b">
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        {kicker && <Kicker className="mb-3">{kicker}</Kicker>}
        <h1 className="max-w-4xl text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-balance">
          {title}
        </h1>
        {intro && (
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed">{intro}</p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </div>
  );
}
