import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getResearchAreas, getSiteImages } from "@/app/lib/content";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Research",
  description:
    "AI, machine learning, NLP and African language technology — the research of Prof. Ibrahim Adeyanju.",
  path: "/research",
});

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
        title="Research"
        intro="Over 970 citations across journal articles and conference papers on artificial intelligence and African language technology, from Yoruba handwriting corpora to automated grading."
      />

      {/* Research areas */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="border-t">
            {research.map((r, i) => (
              <Reveal key={r.id} delay={i * 60}>
                <div className="grid md:grid-cols-[1fr_1.25fr] gap-3 md:gap-14 items-baseline border-b py-9 px-2">
                  <h2 className="text-xl md:text-2xl font-semibold tracking-tight">
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
      <section className="py-16 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <figure className="relative">
              <div
                className="absolute -inset-3 rounded-xl bg-secondary rotate-1"
                aria-hidden="true"
              />
              <Image
                src={photo.src}
                alt={photo.alt}
                width={photo.width}
                height={photo.height}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="relative rounded-xl w-full"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                {photo.caption ??
                  "PhD in Computing — Robert Gordon University, Aberdeen (2011)"}
              </figcaption>
            </figure>
          </Reveal>

          <Reveal delay={120}>
            <SectionHeading
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
              className="mt-8 h-11 rounded-lg px-6 text-sm font-bold"
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
