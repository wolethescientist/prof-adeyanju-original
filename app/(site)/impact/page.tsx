import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InitiativeCard } from "@/app/components/cards";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { Accent, Kicker, PageHeader, SectionHeading } from "@/app/components/ui";
import { getInitiativeCards } from "@/app/lib/articles";
import { getImpactStats, getSiteImages } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Impact — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Initiatives delivered at Galaxy Backbone under Prof. Adeyanju: 1Government Cloud, GovMail, Project 774 and more.",
};

export const revalidate = 300;

export default async function ImpactPage() {
  const [initiatives, keyNumbers, images] = await Promise.all([
    getInitiativeCards(),
    getImpactStats(),
    getSiteImages(),
  ]);

  const team = images["team-photo"];

  return (
    <>
      <PageHeader
        kicker="Impact at Galaxy Backbone"
        title={
          <>
            Building the backbone of a <Accent>digital nation</Accent>
          </>
        }
        intro="Under the Integrated Digital Transformation Strategy (2023–2028), his team has repositioned Galaxy Backbone as one of Nigeria's most strategic digital institutions — earning more than twenty industry awards in two years."
      />

      {keyNumbers.length > 0 && (
        <section className="relative bg-ink text-white overflow-hidden">
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(29,78,216,0.35),transparent_55%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <Reveal>
              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
                {keyNumbers.map((s) => (
                  <div key={s.id} className="border-t border-white/20 pt-5">
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="font-heading text-5xl md:text-6xl font-medium tracking-tight">
                      <Counter to={s.value} suffix={s.suffix} />
                    </dd>
                    <p className="mt-3 text-sm text-white/70 leading-snug max-w-[15rem]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </dl>
            </Reveal>
          </div>
        </section>
      )}

      <section id="initiatives" className="relative py-20 md:py-24 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Flagship initiatives"
              title={
                <>
                  The programmes, <Accent>one strategy</Accent>
                </>
              }
              intro="Open any initiative for the full story — what it is, who it serves and what it has delivered."
            />
          </Reveal>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item, i) => (
              <li key={item.id}>
                <Reveal delay={(i % 3) * 80} className="h-full">
                  <InitiativeCard item={item} />
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative pb-20 md:pb-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <figure className="relative overflow-hidden rounded-3xl border shadow-[0_25px_60px_rgba(16,24,40,0.12)]">
              <Image
                src={team.src}
                alt={team.alt}
                width={team.width}
                height={team.height}
                sizes="(min-width: 1152px) 1104px, 100vw"
                className="w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/10 to-transparent"
                aria-hidden="true"
              />
              <figcaption className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-10">
                <Kicker className="text-[#8fb0ff]">The team</Kicker>
                <p className="mt-2 max-w-xl font-heading text-xl md:text-2xl text-white leading-snug">
                  {team.caption ??
                    "Prof. Adeyanju with Galaxy Backbone's executive management team."}
                </p>
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section className="relative py-20 md:py-24 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <SectionHeading
              kicker="Government-as-a-Platform"
              title={
                <>
                  A sovereign digital <Accent>foundation</Accent>
                </>
              }
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed text-lg">
              <p>
                From the WIOCC partnership deepening the national fibre
                backbone, to 24/7 security operations, ISO recertification and
                an Integrated Management System — the strategy treats
                government digital infrastructure as a platform every ministry,
                department and agency can build on.
              </p>
              <p>
                The result: data sovereignty advanced, planned data centres
                across Nigeria&apos;s geopolitical zones, and connectivity
                reaching from federal secretariats to university hostels.
              </p>
              <Button
                size="lg"
                className="mt-2 self-start h-12 rounded-full px-7 text-sm font-bold"
                nativeButton={false}
                render={<Link href="/recognition" />}
              >
                See the recognition
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
