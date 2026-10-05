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
    <div className="relative overflow-hidden bg-card border-b">
      <div className="dotgrid absolute inset-0" aria-hidden="true" />
      <div
        className="animate-glow absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.09),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
        {kicker && (
          <div className="animate-fade-up">
            <Kicker className="mb-3">{kicker}</Kicker>
          </div>
        )}
        <h1
          className="animate-fade-up max-w-4xl text-4xl md:text-5xl font-semibold tracking-tight leading-[1.1] text-balance"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="animate-fade-up mt-5 max-w-2xl text-lg text-muted-foreground leading-relaxed"
            style={{ animationDelay: "240ms" }}
          >
            {intro}
          </p>
        )}
        {children && (
          <div className="animate-fade-up mt-8" style={{ animationDelay: "360ms" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
