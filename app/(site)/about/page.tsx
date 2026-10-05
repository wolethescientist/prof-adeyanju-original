import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Kicker, PageHeader, SectionHeading } from "@/app/components/ui";
import { getEducation, getGlance, getHonours } from "@/app/lib/content";

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
  const [atAGlance, education, honours] = await Promise.all([
    getGlance(),
    getEducation(),
    getHonours(),
  ]);

  return (
    <>
      <PageHeader
        title="About Prof. Adeyanju"
        intro="Professor of Computer Engineering and Managing Director/CEO of Galaxy Backbone Limited."
      />

      {/* Bio + at a glance */}
      <section className="py-20">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-start">
          <div>
            <div className="flex flex-col gap-5 text-lg text-muted-foreground leading-relaxed">
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

          </div>

          <div>
            <div className="rounded-xl border bg-card p-8">
              <h2 className="mb-7">
                <Kicker>At a glance</Kicker>
              </h2>
              <dl className="flex flex-col gap-5">
                {atAGlance.map((row) => (
                  <div key={row.id} className="grid grid-cols-[8.5rem_1fr] gap-4 items-baseline">
                    <dt className="text-xs font-medium text-muted-foreground">
                      {row.label}
                    </dt>
                    <dd className="font-heading text-lg text-foreground leading-snug">
                      {row.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-x-8">
              {memberships.map(([title, sub]) => (
                <div key={title} className="border-t py-5">
                  <p className="font-heading text-2xl font-medium">{title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {sub}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="py-20 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6">
          <div>
            <SectionHeading
              title="Education"
            />
          </div>

          <div className="mt-12 border-t">
            {education.map((e, i) => (
              <div key={e.id}>
                <a
                  href={e.href ?? undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group grid md:grid-cols-[9rem_1fr_auto_auto] gap-2 md:gap-8 items-baseline border-b py-7 px-2 cursor-pointer transition-colors duration-200 hover:bg-accent/60"
                >
                  <p className="text-xs font-medium text-primary tabular-nums">{e.years}</p>
                  <div>
                    <h3 className="text-xl md:text-2xl font-medium group-hover:text-primary transition-colors duration-200">
                      {e.degree}
                    </h3>
                    {e.description && (
                      <p className="mt-1 text-sm font-medium text-muted-foreground leading-relaxed">
                        {e.description}
                      </p>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground">{e.school}</p>
                  <ArrowUpRight
                    className="hidden md:block size-4 shrink-0 self-center text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    aria-hidden="true"
                  />
                </a>
              </div>
            ))}
          </div>

          <div>
            <Button
              size="lg"
              className="mt-10 h-11 rounded-lg px-6 text-sm font-bold"
              nativeButton={false}
              render={<Link href="/journey" />}
            >
              Follow the full journey
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>
        </div>
      </section>
      {honours.length > 0 && (
        <section id="honours" className="py-20 border-t">
          <div className="mx-auto max-w-6xl px-6">
            <SectionHeading title="Honours and fellowships" />
            <ul className="mt-10 grid gap-x-12 md:grid-cols-2 border-t">
              {honours.map((honour) => (
                <li key={honour.id} className="border-b py-5">
                  <p className="font-medium text-foreground">{honour.text}</p>
                  {honour.description && (
                    <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                      {honour.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
