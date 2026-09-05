import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Reveal from "@/app/components/Reveal";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getEducation, getGlance } from "@/app/lib/content";

export const metadata: Metadata = {
  title: "About — Prof. Ibrahim Adepoju Adeyanju",
  description:
    "Professor of Computer Engineering, AI researcher and MD/CEO of Galaxy Backbone Limited.",
};

const memberships = [
  ["COREN", "Registered Computer Engineer"],
  ["Fellow, NYA", "Nigerian Young Academy"],
  ["MIT-ETT", "Empowering the Teachers Fellow"],
  ["Top 100", "Leading personalities in Nigerian telecoms"],
];

export const revalidate = 300;

export default async function AboutPage() {
  const [atAGlance, education] = await Promise.all([
    getGlance(),
    getEducation(),
  ]);

  return (
    <>
      <PageHeader
        kicker="About"
        title={
          <>
            From first-class scholar to{" "}
            <span className="text-primary">national digital architect</span>
          </>
        }
        intro="Engineer, professor and public sector leader — one career built across three continents."
      />

      {/* Bio + at a glance */}
      <section className="relative py-20">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-start">
          <Reveal>
            <div className="flex flex-col gap-5 text-muted-foreground leading-relaxed font-medium">
              <p>
                Prof. Ibrahim Adepoju Adeyanju is a Professor of Computer
                Engineering specialising in Intelligent Systems, and the
                Managing Director/CEO of Galaxy Backbone Limited — the ICT
                and shared-services provider to Nigeria&apos;s Federal
                Government under the Ministry of Communications, Innovation
                and Digital Economy.
              </p>
              <p>
                His journey runs from a First Class degree at LAUTECH through
                a PhD in Computing at Robert Gordon University, Aberdeen, an
                EPSRC postdoctoral fellowship, an MIT teaching fellowship,
                and a professorship at Federal University Oye-Ekiti — where
                he served as pioneer Director of Quality Assurance.
              </p>
              <p>
                Appointed MD/CEO by President Bola Ahmed Tinubu in February
                2024, he leads the institution trusted with Nigeria&apos;s
                sovereign cloud, national fibre backbone and government
                cybersecurity.
              </p>
            </div>

            <blockquote className="mt-9 border-l-4 border-primary pl-6 py-1">
              <p className="text-lg font-semibold leading-relaxed text-foreground">
                One career, three continents — from the lecture theatre to the
                boardroom of Nigeria&apos;s digital backbone.
              </p>
            </blockquote>
          </Reveal>

          <Reveal delay={150}>
            <div className="rounded-3xl border bg-card p-8 md:p-9 border-t-4 border-t-primary shadow-[0_1px_2px_rgba(16,24,40,0.05)]">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary mb-7">
                At a glance
              </h2>
              <dl className="flex flex-col gap-5">
                {atAGlance.map((row) => (
                  <div key={row.id} className="grid grid-cols-[8.5rem_1fr] gap-4 items-baseline">
                    <dt className="text-xs font-bold uppercase tracking-wide text-muted-foreground/80">
                      {row.label}
                    </dt>
                    <dd className="text-sm font-semibold text-foreground leading-relaxed">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-8">
              {memberships.map(([title, sub]) => (
                <div key={title} className="border-t py-5">
                  <p className="text-lg font-bold">{title}</p>
                  <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Education */}
      <section className="relative py-20 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Universities"
              title={
                <>
                  Trained on <span className="text-primary">three continents</span>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 border-t">
            {education.map((e, i) => (
              <Reveal key={e.id} delay={i * 60}>
                <a
                  href={e.href ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid md:grid-cols-[10rem_1fr_auto_auto] gap-2 md:gap-8 items-baseline border-b py-6 px-2 cursor-pointer transition-colors duration-200 hover:bg-accent/60"
                >
                  <p className="text-sm font-bold text-primary tabular-nums">{e.years}</p>
                  <h3 className="text-lg md:text-xl font-bold group-hover:text-primary transition-colors duration-200">
                    {e.degree}
                  </h3>
                  <p className="text-sm font-semibold text-muted-foreground">{e.school}</p>
                  <ArrowUpRight
                    className="hidden md:block size-4 shrink-0 self-center text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </Reveal>
            ))}
          </div>

          <Reveal delay={200}>
            <Button
              size="lg"
              className="mt-10 h-12 rounded-full px-7 text-sm font-bold"
              nativeButton={false}
              render={<Link href="/journey" />}
            >
              Follow the full journey
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
