import { cn } from "@/lib/utils";

/** The small label above a heading: what kind of thing follows. */
export function Kicker({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <p
      className={cn(
        "font-mono text-[0.72rem] font-medium uppercase tracking-[0.2em] text-primary",
        className
      )}
    >
      {children}
    </p>
  );
}

export function SectionHeading({
  kicker,
  title,
  intro,
  className,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("max-w-3xl", className)}>
      <Kicker className="mb-4">{kicker}</Kicker>
      <h2 className="text-4xl md:text-[3.25rem] font-medium tracking-[-0.02em] leading-[1.05] text-balance">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
          {intro}
        </p>
      )}
    </div>
  );
}

/** Words in a heading set apart in the brand blue, in italic. */
export function Accent({ children }: { children: React.ReactNode }) {
  return <em className="text-primary italic font-normal">{children}</em>;
}

export function PageHeader({
  kicker,
  title,
  intro,
  children,
}: {
  kicker: string;
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
      <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-14 md:pt-40 md:pb-16">
        <div className="animate-fade-up">
          <Kicker>{kicker}</Kicker>
        </div>
        <h1
          className="animate-fade-up mt-6 max-w-4xl text-5xl md:text-7xl font-medium tracking-[-0.025em] leading-[1.02] text-balance"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="animate-fade-up mt-7 max-w-2xl text-lg md:text-xl text-muted-foreground leading-relaxed"
            style={{ animationDelay: "240ms" }}
          >
            {intro}
          </p>
        )}
        {children && (
          <div className="animate-fade-up mt-10" style={{ animationDelay: "360ms" }}>
            {children}
          </div>
        )}
      </div>
    </div>
  );
}
