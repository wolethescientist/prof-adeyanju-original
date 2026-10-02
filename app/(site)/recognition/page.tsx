import type { Metadata } from "next";
import AwardFeed from "@/app/components/AwardFeed";
import { PressCard } from "@/app/components/cards";
import Counter from "@/app/components/Counter";
import Laurel from "@/app/components/Laurel";
import Reveal from "@/app/components/Reveal";
import { Accent, PageHeader, SectionHeading } from "@/app/components/ui";
import { getAwardCards, getPressCards } from "@/app/lib/articles";
import { getHonours } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Recognition — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Awards, honours and press coverage for Prof. Ibrahim Adeyanju and Galaxy Backbone — each with its full story.",
};

export const revalidate = 300;

export default async function RecognitionPage() {
  const [honours, awards, press] = await Promise.all([
    getHonours(),
    getAwardCards(),
    getPressCards(),
  ]);

  const sections = [
    { href: "#awards", label: "Awards", count: awards.length },
    { href: "#honours", label: "Honours", count: honours.length },
    { href: "#press", label: "In the press", count: press.length },
  ].filter((section) => section.count > 0);

  return (
    <>
      <PageHeader
        kicker="Recognition"
        title={
          <>
            Honours <Accent>&amp; awards</Accent>
          </>
        }
        intro="Scholarships, fellowships and national recognition — for the man, and for the institution he leads. Open any award to read its story."
      >
        <nav aria-label="On this page">
          <ul className="flex flex-wrap gap-2">
            {sections.map((section) => (
              <li key={section.href}>
                <a
                  href={section.href}
                  className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm font-semibold text-foreground hover:border-primary/40 hover:text-primary transition-colors"
                >
                  {section.label}
                  <span className="font-mono text-[0.7rem] text-muted-foreground tabular-nums">
                    {section.count}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </PageHeader>

      {awards.length > 0 && (
        <section id="awards" className="relative py-20 md:py-24 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <SectionHeading
                kicker="Awards"
                title={
                  <>
                    Every award, <Accent>with its story</Accent>
                  </>
                }
                className="mb-10"
              />
            </Reveal>
            <AwardFeed awards={awards} />

            <Reveal>
              <div className="relative mt-14 overflow-hidden rounded-3xl bg-ink px-8 py-10 text-white md:px-12 md:py-12">
                <div
                  className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.35),transparent_60%)]"
                  aria-hidden="true"
                />
                <Laurel className="absolute -right-8 -bottom-10 size-56 text-gold/15" />
                <div className="relative grid items-center gap-6 md:grid-cols-[auto_1fr] md:gap-12">
                  <p className="font-heading text-7xl font-medium tracking-tight text-[#f3dc9b]">
                    <Counter to={20} suffix="+" />
                  </p>
                  <p className="max-w-2xl text-base md:text-lg text-white/80 leading-relaxed">
                    industry awards won by Galaxy Backbone in the first two years
                    of his tenure — including first place overall in the 2025
                    Federal Government Website Performance Scorecard.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>
      )}

      {honours.length > 0 && (
        <section id="honours" className="relative py-20 md:py-24 bg-card border-y scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6 grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <SectionHeading
                kicker="Personal honours"
                title={
                  <>
                    Scholarships, fellowships <Accent>&amp; firsts</Accent>
                  </>
                }
                intro="The recognition that marked each step of the journey, from Ogbomoso to Abuja."
              />
            </Reveal>
            <Reveal delay={120}>
              <ol className="border-t">
                {honours.map((honour) => (
                  <li
                    key={honour.id}
                    className="grid grid-cols-[1.25rem_1fr] gap-4 border-b py-5"
                  >
                    <span
                      className="mt-2 size-2.5 rotate-45 bg-gold"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="font-heading text-xl leading-snug">{honour.text}</p>
                      {honour.description && (
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                          {honour.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </Reveal>
          </div>
        </section>
      )}

      {press.length > 0 && (
        <section id="press" className="relative py-20 md:py-24 scroll-mt-20">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <SectionHeading
                kicker="In the press"
                title={
                  <>
                    What the papers <Accent>say</Accent>
                  </>
                }
              />
            </Reveal>
            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {press.map((item, i) => (
                <li key={item.id}>
                  <Reveal delay={(i % 3) * 80} className="h-full">
                    <PressCard item={item} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
