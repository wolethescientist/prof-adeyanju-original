import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NewsCard } from "@/app/components/cards";
import { Kicker, SectionHeading } from "@/app/components/ui";
import { getInitiativeCards } from "@/app/lib/articles";
import {
  getMarquee,
  getResearchAreas,
  getSiteImages,
  getStats,
} from "@/app/lib/content";
import { formatCount } from "@/app/lib/format";
import { resolveIcon } from "@/app/lib/icons";
import { getLatestNews } from "@/app/lib/news";

/* Rendered statically and refreshed on demand: publishing in the CMS calls
   revalidatePath("/"), so edits appear without a redeploy. */
export const revalidate = 300;

export default async function Home() {
  const [stats, keywords, initiatives, research, latest, images] = await Promise.all([
    getStats(),
    getMarquee(),
    getInitiativeCards(),
    getResearchAreas(),
    getLatestNews(3),
    getSiteImages(),
  ]);

  const hero = images["hero-portrait"];
  const profile = images["profile-portrait"];
  const team = images["team-photo"];

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="border-b bg-card">
        <div className="mx-auto max-w-6xl px-6 py-14 md:py-20 grid md:grid-cols-[1.15fr_0.85fr] gap-12 items-center">
          <div>
            <Kicker>Professor · Engineer · MD/CEO, Galaxy Backbone</Kicker>
            <h1 className="mt-4 text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]">
              Prof. Ibrahim Adepoju Adeyanju
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Professor of Computer Engineering and AI researcher, leading the
              company that runs the Federal Government of Nigeria&apos;s
              digital infrastructure.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="h-11 rounded-lg px-6 text-sm font-bold"
                nativeButton={false}
                render={<Link href="/impact" />}
              >
                Explore the impact
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-lg px-6 text-sm font-bold bg-card"
                nativeButton={false}
                render={<Link href="/news" />}
              >
                News &amp; awards
              </Button>
            </div>
            {keywords.length > 0 && (
              <ul className="mt-8 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <li
                    key={keyword}
                    className="rounded-md border bg-background px-3 py-1 text-sm text-muted-foreground"
                  >
                    {keyword}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="justify-self-center">
            <Image
              src={hero.src}
              alt={hero.alt}
              width={hero.width}
              height={hero.height}
              priority
              sizes="(min-width: 768px) 416px, 100vw"
              className="w-full max-w-md rounded-xl h-auto"
            />
          </div>
        </div>
      </section>

      {/* ============================ LATEST ============================ */}
      {latest.length > 0 && (
        <section className="border-b py-14" aria-labelledby="latest">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <Kicker className="mb-1">What&apos;s new</Kicker>
                <h2 id="latest" className="text-3xl font-semibold tracking-tight">
                  Latest news &amp; awards
                </h2>
              </div>
              <Button
                variant="outline"
                className="h-10 rounded-lg px-5 text-sm font-bold bg-card"
                nativeButton={false}
                render={<Link href="/news" />}
              >
                All news &amp; awards
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>

            <ul className="mt-8 columns-1 gap-6 md:columns-3">
              {latest.map((item) => (
                <li key={item.id} className="mb-6 break-inside-avoid">
                  <NewsCard item={item} />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ============================ STATS BAND ============================ */}
      {stats.length > 0 && (
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-6xl px-6 py-16">
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-10">
              {stats.map((s) => (
                <div key={s.id} className="border-t border-white/20 pt-5">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-4xl md:text-5xl font-semibold tracking-tight">
                    {formatCount(s.value, s.suffix)}
                  </dd>
                  <p className="mt-3 text-sm text-white/70 leading-snug max-w-[16rem]">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* ============================ PROFILE ============================ */}
      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <SectionHeading title="About Prof. Adeyanju" />
            <div className="mt-6 flex flex-col gap-5 text-muted-foreground leading-relaxed text-lg max-w-xl">
              <p>
                Prof. Adeyanju graduated top of his class at LAUTECH, earned a
                PhD in Computing at Robert Gordon University, Aberdeen, and
                taught at MIT as an Empowering the Teachers fellow before
                becoming Professor of Intelligent Systems at Federal
                University Oye-Ekiti.
              </p>
              <p>
                Today he leads Galaxy Backbone Limited, the company entrusted
                with Nigeria&apos;s sovereign cloud, national fibre backbone
                and the digital services used across the federal government.
              </p>
            </div>
            <Button
              size="lg"
              variant="outline"
              className="mt-8 h-11 rounded-lg px-6 text-sm font-bold bg-card"
              nativeButton={false}
              render={<Link href="/about" />}
            >
              More about him
              <ArrowRight data-icon="inline-end" />
            </Button>
          </div>

          <figure className="justify-self-center max-w-xs">
            <Image
              src={profile.src}
              alt={profile.alt}
              width={profile.width}
              height={profile.height}
              sizes="(min-width: 768px) 300px, 80vw"
              className="w-full h-auto rounded-xl"
            />
            {profile.caption && (
              <figcaption className="mt-3 text-sm text-muted-foreground">
                {profile.caption}
              </figcaption>
            )}
          </figure>
        </div>
      </section>

      {/* ============================ LEADERSHIP ============================ */}
      <section className="py-16 border-t bg-card">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeading
            title="Leadership at Galaxy Backbone"
            intro="Since February 2024, the Integrated Digital Transformation Strategy has guided how Galaxy Backbone serves the Federal Government."
          />

          <div className="mt-10 grid md:grid-cols-2 gap-12 items-center">
            <figure>
              <Image
                src={team.src}
                alt={team.alt}
                width={team.width}
                height={team.height}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="w-full h-auto rounded-xl"
              />
              <figcaption className="mt-3 text-sm text-muted-foreground">
                {team.caption ?? "With Galaxy Backbone's executive management team, Abuja."}
              </figcaption>
            </figure>

            <div>
              <ul className="divide-y border-y">
                {initiatives.slice(0, 4).map((item) => {
                  const Icon = resolveIcon(item.icon);
                  return (
                    <li key={item.id}>
                      <Link href={item.href} className="group flex gap-4 py-5 pr-2">
                        <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                          <Icon className="size-5" aria-hidden="true" />
                        </span>
                        <span className="grow">
                          <span className="block text-lg font-semibold group-hover:text-primary transition-colors">
                            {item.title}
                          </span>
                          <span className="mt-1 block text-sm text-muted-foreground leading-relaxed line-clamp-2">
                            {item.summary}
                          </span>
                        </span>
                        <ArrowRight
                          className="mt-1.5 size-4 shrink-0 text-muted-foreground group-hover:text-primary"
                          aria-hidden="true"
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
              <Button
                size="lg"
                className="mt-6 h-11 rounded-lg px-6 text-sm font-bold"
                nativeButton={false}
                render={<Link href="/impact#initiatives" />}
              >
                See every initiative
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ RESEARCH ============================ */}
      <section className="py-16 border-t">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading title={`Research: ${formatCount(970, "+")} citations`} />
            <Button
              variant="outline"
              className="h-10 rounded-lg px-5 text-sm font-bold bg-card"
              nativeButton={false}
              render={
                <a
                  href="https://scholar.google.com/citations?user=Z97RmFAAAAAJ"
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Google Scholar
              <ArrowUpRight data-icon="inline-end" />
            </Button>
          </div>

          <div className="mt-10 grid sm:grid-cols-2 gap-x-14">
            {research.map((r) => (
              <div key={r.id} className="border-t py-6">
                <h3 className="text-xl font-semibold">{r.area}</h3>
                <p className="mt-2 text-muted-foreground leading-relaxed">{r.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
