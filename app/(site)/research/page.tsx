import { ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getResearchAreas } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Research — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "AI, machine learning, NLP and African language technology — the research of Prof. Ibrahim Adeyanju.",
};

export const revalidate = 300;

export default async function ResearchPage() {
  const research = await getResearchAreas();

  return (
    <>
      <PageHeader
        kicker="Research & Academia"
        title={
          <>
            Two decades of{" "}
            <span className="text-primary">intelligent systems research</span>
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
                <div className="grid md:grid-cols-[4rem_1fr_1.2fr] gap-3 md:gap-10 items-baseline border-b py-8 px-2">
                  <p className="text-sm font-bold text-primary/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight">
                    {r.area}
                  </h2>
                  <p className="text-sm md:text-base text-muted-foreground leading-relaxed font-medium">
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
                src="/images/portrait-2.jpg"
                alt="Dr. Ibrahim Adeyanju at his PhD graduation, Robert Gordon University"
                width={700}
                height={400}
                className="relative rounded-[1.6rem] w-full object-cover shadow-[0_25px_50px_rgba(16,24,40,0.14)]"
              />
              <figcaption className="relative mt-4 text-center text-xs font-semibold text-muted-foreground">
                PhD in Computing — Robert Gordon University, Aberdeen (2011)
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
