import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getAwards, getHonours, getPress } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Recognition — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Honours, awards and press coverage for Prof. Ibrahim Adeyanju and Galaxy Backbone.",
};

export const revalidate = 300;

export default async function RecognitionPage() {
  const [honours, gbbAwards, press] = await Promise.all([
    getHonours(),
    getAwards(),
    getPress(),
  ]);

  return (
    <>
      <PageHeader
        kicker="Recognition"
        title={
          <>
            Honours & <span className="text-primary">awards</span>
          </>
        }
        intro="Scholarships, fellowships and national recognition — for the man, and for the institution he leads."
      />

      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6 grid lg:grid-cols-2 gap-x-16 gap-y-14 items-start">
          <Reveal>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Personal honours
            </h2>
            <ul className="border-t">
              {honours.map((h) => (
                <li
                  key={h.id}
                  className="flex items-baseline gap-4 border-b py-4 text-sm md:text-base font-semibold"
                >
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-primary translate-y-[-2px]"
                    aria-hidden="true"
                  />
                  <span>
                    {h.text}
                    {h.description && (
                      <span className="mt-1 block text-sm font-medium text-muted-foreground leading-relaxed">
                        {h.description}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={120}>
            <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-4">
              Galaxy Backbone under his leadership
            </h2>
            <ul className="border-t">
              {gbbAwards.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-4 border-b py-4 text-sm md:text-base font-semibold"
                >
                  <span>{a.award}</span>
                  <Badge variant="secondary" className="shrink-0 font-bold">
                    {a.year}
                  </Badge>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-3xl bg-[#0b1220] text-white p-8 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.35),transparent_60%)]"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-5xl font-bold tracking-tight">
                  <Counter to={20} suffix="+" />
                </p>
                <p className="mt-2 text-sm font-medium text-white/80 leading-relaxed">
                  awards won by Galaxy Backbone in the first two years of his
                  tenure — including ranking 1st overall in the 2025 Federal
                  Government Website Performance Scorecard.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="relative py-20 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="In the Press"
              title={
                <>
                  Selected <span className="text-primary">coverage</span>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 border-t">
            {press.map((p, i) => (
              <Reveal key={p.id} delay={i * 60}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-6 border-b py-6 px-2 cursor-pointer transition-colors duration-200 hover:bg-accent/60"
                >
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-bold uppercase tracking-wide"
                  >
                    {p.outlet}
                  </Badge>
                  <span className="grow">
                    <span className="block text-base md:text-lg font-semibold leading-snug group-hover:text-primary transition-colors duration-200">
                      {p.title}
                    </span>
                    {p.description && (
                      <span className="mt-1 block text-sm font-medium text-muted-foreground leading-relaxed">
                        {p.description}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
