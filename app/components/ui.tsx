export function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
      {children}
    </p>
  );
}

export function SectionHeading({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
        {kicker}
      </p>
      <h2 className="text-4xl md:text-5xl font-bold tracking-tight leading-[1.08]">
        {title}
      </h2>
      {intro && (
        <p className="mt-5 text-lg text-muted-foreground leading-relaxed font-medium">
          {intro}
        </p>
      )}
    </div>
  );
}

export function PageHeader({
  kicker,
  title,
  intro,
}: {
  kicker: string;
  title: React.ReactNode;
  intro?: string;
}) {
  return (
    <div className="relative overflow-hidden bg-card border-b">
      <div className="dotgrid absolute inset-0" aria-hidden="true" />
      <div
        className="animate-glow absolute inset-x-0 top-0 h-full bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.09),transparent_60%)]"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-6 pt-40 pb-16">
        <div className="animate-fade-up">
          <Kicker>{kicker}</Kicker>
        </div>
        <h1
          className="animate-fade-up mt-6 text-5xl md:text-6xl font-bold tracking-tight leading-[1.06]"
          style={{ animationDelay: "120ms" }}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="animate-fade-up mt-6 max-w-2xl text-lg text-muted-foreground leading-relaxed font-medium"
            style={{ animationDelay: "240ms" }}
          >
            {intro}
          </p>
        )}
      </div>
    </div>
  );
}
