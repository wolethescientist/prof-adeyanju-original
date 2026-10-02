import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { Accent, PageHeader, SectionHeading } from "@/app/components/ui";
import { getResearchAreas, getSiteImages } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Research — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "AI, machine learning, NLP and African language technology — the research of Prof. Ibrahim Adeyanju.",
};

export const revalidate = 300;

export default async function ResearchPage() {
  const [research, images] = await Promise.all([
    getResearchAreas(),
    getSiteImages(),
  ]);

  const photo = images["research-portrait"];

  return (
    <>
      <PageHeader
        kicker="Research & Academia"
        title={
          <>
            Two decades of <Accent>intelligent systems research</Accent>
          </>
        }
        intro="With over 970 citations across peer-reviewed journals and conference papers, his research bridges artificial intelligence and African language technology — from Yoruba handwriting corpora to automated grading systems."
      />

      {/* Research areas */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-t">
            {research.map((r, i) => (
              <Reveal key={r.id} delay={i * 60}>
                <div className="grid md:grid-cols-[1fr_1.25fr] gap-3 md:gap-14 items-baseline border-b py-9 px-2">
                  <h2 className="text-2xl md:text-3xl font-medium tracking-[-0.01em]">
                    {r.area}
                  </h2>
                  <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                    {r.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PhD photo + scholar */}
      <section className="relative py-20 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <figure className="relative">
              <div
                className="absolute -inset-3 rounded-[2rem] bg-secondary rotate-1"
                aria-hidden="true"
              />
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="relative rounded-[1.6rem] w-full object-cover shadow-[0_25px_50px_rgba(16,24,40,0.14)]"
              />
              <figcaption className="relative mt-5 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {photo.caption ??
                  "PhD in Computing — Robert Gordon University, Aberdeen (2011)"}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <SectionHeading
              kicker="Publications"
              title={
                <>
                  <span className="text-primary">
                    <Counter to={970} suffix="+" />
                  </span>{" "}
                  scholarly citations
                </>
              }
              intro="Peer-reviewed journal articles and conference papers spanning pattern recognition, case-based reasoning, Yoruba character recognition and automated grading — indexed on Google Scholar."
            />
            <Button
              size="lg"
              className="mt-8 h-12 rounded-full px-7 text-sm font-bold"
              nativeButton={false}
              render={
                <a
                  href="https://scholar.google.com/citations?user=Z97RmFAAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              View publications on Google Scholar
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
