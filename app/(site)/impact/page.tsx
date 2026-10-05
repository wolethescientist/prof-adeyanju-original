import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InitiativeCard } from "@/app/components/cards";
import { PageHeader, SectionHeading } from "@/app/components/ui";
import { getInitiativeCards } from "@/app/lib/articles";
import { getImpactStats, getSiteImages } from "@/app/lib/content";
import { formatCount } from "@/app/lib/format";

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
        title="Impact at Galaxy Backbone"
        intro="Under the Integrated Digital Transformation Strategy (2023–2028), Galaxy Backbone has expanded its cloud, connectivity and security services for the Federal Government."
      />

      {keyNumbers.length > 0 && (
        <section className="bg-ink text-white">
          <div className="relative mx-auto max-w-6xl px-6 py-16">
            <div>
              <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
                {keyNumbers.map((s) => (
                  <div key={s.id} className="border-t border-white/20 pt-5">
                    <dt className="sr-only">{s.label}</dt>
                    <dd className="text-4xl md:text-5xl font-semibold tracking-tight">
                      {formatCount(s.value, s.suffix)}
                    </dd>
                    <p className="mt-3 text-sm text-white/70 leading-snug max-w-[15rem]">
                      {s.label}
                    </p>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      )}

      <section id="initiatives" className="py-16 scroll-mt-20">
        <div className="mx-auto max-w-6xl px-6">
          <div>
            <SectionHeading
              title="Flagship initiatives"
              intro="Open any initiative to read what it is, who it serves and what it has delivered."
            />
          </div>

          <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {initiatives.map((item) => (
              <li key={item.id}>
                <div className="h-full">
                  <InitiativeCard item={item} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="pb-16">
        <div className="mx-auto max-w-6xl px-6">
          <div>
            <figure>
              <Image
                src={team.src}
                alt={team.alt}
                width={team.width}
                height={team.height}
                sizes="(min-width: 1152px) 1104px, 100vw"
                className="w-full rounded-xl"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                {team.caption ??
                  "Prof. Adeyanju with Galaxy Backbone's executive management team."}
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="py-16 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-14 items-center">
          <div>
            <SectionHeading
              title="Government-as-a-Platform"
            />
          </div>
          <div>
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
                className="mt-2 self-start h-11 rounded-lg px-6 text-sm font-bold"
                nativeButton={false}
                render={<Link href="/news" />}
              >
                News and awards
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
