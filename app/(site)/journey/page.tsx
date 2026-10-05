import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
        title="Career journey"
        intro="From Ogbomoso to Abuja: education, research, teaching and public service."
      />

      <section className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <ol className="relative border-l-2 border-secondary ml-2 md:ml-4">
            {timeline.map((t, i) => (
              <li key={t.id} className="relative pl-10 md:pl-14 pb-14 last:pb-0">
                <span
                  className="absolute -left-[7px] top-1.5 size-3 rounded-full bg-primary border-2 border-background"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-semibold text-primary">
                    {t.period}
                  </p>
                  <h2 className="mt-3 text-2xl md:text-3xl font-semibold tracking-tight leading-tight">
                    {t.title}
                  </h2>
                  <p className="mt-2 text-base font-semibold text-foreground/70">
                    {t.org}
                  </p>
                  <p className="mt-4 max-w-2xl text-lg text-muted-foreground leading-relaxed">
                    {t.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>

          <div>
            <div className="mt-16 rounded-xl border bg-card p-8 md:p-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-semibold tracking-tight max-w-xl leading-tight">
                  What has this leadership delivered?
                </h2>
                <Button
                  size="lg"
                  className="mt-6 h-11 rounded-lg px-6 text-sm font-bold"
                  nativeButton={false}
                  render={<Link href="/impact" />}
                >
                  Explore the impact
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
