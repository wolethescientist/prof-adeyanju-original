import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Reveal from "@/app/components/Reveal";
import { PageHeader } from "@/app/components/ui";
import { getTimeline } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Journey — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "From a First Class at LAUTECH to MD/CEO of Galaxy Backbone — the career of Prof. Ibrahim Adeyanju.",
};

export const revalidate = 300;

export default async function JourneyPage() {
  const timeline = await getTimeline();

  return (
    <>
      <PageHeader
        kicker="The Journey"
        title={
          <>
            From <span className="text-primary">Ogbomoso to Abuja</span>
          </>
        }
        intro="Six chapters: Ogbomoso, Aberdeen, Cambridge, Oye-Ekiti and Abuja."
      />

      <section className="relative py-20">
        <div className="mx-auto max-w-5xl px-6">
          <ol className="relative border-l-2 border-secondary ml-2 md:ml-4">
            {timeline.map((t, i) => (
              <li key={t.id} className="relative pl-10 md:pl-14 pb-14 last:pb-0">
                <span
                  className="absolute -left-[9px] top-1.5 size-4 rounded-full bg-primary border-4 border-background"
                  aria-hidden="true"
                />
                <Reveal delay={i * 60}>
                  <p className="text-sm font-bold uppercase tracking-[0.15em] text-primary">
                    {t.period}
                  </p>
                  <h2 className="mt-3 text-2xl md:text-3xl font-bold tracking-tight leading-snug">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-base font-bold text-muted-foreground">
                    {t.org}
                  </p>
                  <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed font-medium">
                    {t.detail}
                  </p>
                </Reveal>
              </li>
            ))}
          </ol>

          <Reveal delay={200}>
            <div className="mt-20 rounded-3xl bg-[#0b1220] text-white p-10 md:p-14 relative overflow-hidden">
              <div
                className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.35),transparent_60%)]"
                aria-hidden="true"
              />
              <div className="relative">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/60">
                  The story continues
                </p>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight max-w-xl leading-snug">
                  What has two years of this leadership delivered?
                </h2>
                <Button
                  size="lg"
                  className="mt-8 h-12 rounded-full px-7 text-sm font-bold bg-white text-[#0b1220] hover:bg-white/90"
                  nativeButton={false}
                  render={<Link href="/impact" />}
                >
                  Explore the impact
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
