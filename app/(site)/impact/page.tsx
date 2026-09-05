import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getImpactStats, getInitiatives } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "Impact — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Initiatives delivered at Galaxy Backbone under Prof. Adeyanju: 1Government Cloud, GovMail, Project 774 and more.",
};

export const revalidate = 300;

export default async function ImpactPage() {
  const [initiatives, keyNumbers] = await Promise.all([
    getInitiatives(),
    getImpactStats(),
  ]);

  return (
    <>
      <PageHeader
        kicker="Impact at Galaxy Backbone"
        title={
          <>
            Building the backbone of a{" "}
            <span className="text-primary">digital nation</span>
          </>
        }
        intro="Under the Integrated Digital Transformation Strategy (2023–2028), his team has repositioned Galaxy Backbone as one of Nigeria's most strategic digital institutions — earning more than twenty industry awards in two years."
      />

      {/* Key numbers */}
      <section className="relative py-16 border-b">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
              {keyNumbers.map((s) => (
                <div key={s.id} className="border-t-2 border-primary/20 pt-5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-4xl md:text-5xl font-bold tracking-tight text-primary">
                    <Counter to={s.value} suffix={s.suffix} />
                  </dd>
                  <p className="mt-2 text-sm font-semibold text-muted-foreground leading-snug">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* Initiatives */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Flagship initiatives"
              title={
                <>
                  Six programmes,{" "}
                  <span className="text-primary">one strategy</span>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-14">
            {initiatives.map((item, i) => (
              <Reveal key={item.id} delay={(i % 2) * 100}>
                <div className="border-t py-7">
                  <p className="text-sm font-bold text-primary/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="mt-2 text-xl font-bold">{item.title}</h2>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
                    {item.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Team photo */}
      <section className="relative pb-20">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="relative rounded-[2rem] overflow-hidden border shadow-[0_25px_60px_rgba(16,24,40,0.12)]">
              <Image
                src="/images/team-gbb.jpeg"
                alt="Prof. Ibrahim Adeyanju with Galaxy Backbone's top management team"
                width={1600}
                height={900}
                className="w-full object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/80 via-transparent to-transparent"
                aria-hidden="true"
              />
              <p className="absolute bottom-5 left-6 right-6 text-sm font-semibold text-white">
                Prof. Adeyanju with Galaxy Backbone&apos;s executive management team.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Strategy closer */}
      <section className="relative py-20 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
          <Reveal>
            <SectionHeading
              kicker="Government-as-a-Platform"
              title={
                <>
                  A sovereign digital{" "}
                  <span className="text-primary">foundation</span>
                </>
              }
            />
          </Reveal>
          <Reveal delay={120}>
            <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed font-medium">
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
