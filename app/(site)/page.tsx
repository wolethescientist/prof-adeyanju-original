import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AwardCard, PressCard } from "@/app/components/cards";
import Counter from "@/app/components/Counter";
import Reveal from "@/app/components/Reveal";
import { Accent, Kicker, SectionHeading } from "@/app/components/ui";
import { getAwardCards, getInitiativeCards, getPressCards } from "@/app/lib/articles";
import {
  getMarquee,
  getResearchAreas,
  getSiteImages,
  getStats,
} from "@/app/lib/content";
import { resolveIcon } from "@/app/lib/icons";

const explore = [
  { href: "/about", title: "About", desc: "The scholar leading Nigeria's federal digital infrastructure." },
  { href: "/journey", title: "Journey", desc: "From a First Class at LAUTECH to MD/CEO — six chapters." },
  { href: "/impact", title: "Impact", desc: "1Government Cloud, GovMail, Project 774 and more." },
  { href: "/research", title: "Research", desc: "AI, machine learning and African language technology." },
  { href: "/recognition", title: "Recognition", desc: "Awards, honours and national press coverage." },
];

/* Rendered statically and refreshed on demand: publishing in the CMS calls
   revalidatePath("/"), so edits appear without a redeploy. */
export const revalidate = 300;

export default async function Home() {
  const [stats, marquee, initiatives, research, press, awards, images] = await Promise.all([
    getStats(),
    getMarquee(),
    getInitiativeCards(),
    getResearchAreas(),
    getPressCards(),
    getAwardCards(),
    getSiteImages(),
  ]);

  const hero = images["hero-portrait"];
  const profile = images["profile-portrait"];
  const team = images["team-photo"];
  const [leadAward, ...moreAwards] = awards;

  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="dotgrid absolute inset-0" aria-hidden="true" />
        <div
          className="animate-glow absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.12),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-36 pb-24 md:pt-40 grid md:grid-cols-[1.15fr_0.85fr] gap-14 items-center">
          <div>
            <div className="animate-fade-up">
              <Kicker>Professor · Engineer · MD/CEO, Galaxy Backbone</Kicker>
            </div>
            <h1
              className="animate-fade-up mt-6 text-[3.4rem] md:text-[5.6rem] font-medium tracking-[-0.03em] leading-[0.98]"
              style={{ animationDelay: "120ms" }}
            >
              Prof. Ibrahim
              <br />
              Adepoju <Accent>Adeyanju</Accent>
            </h1>
            <p
              className="animate-fade-up mt-8 text-lg md:text-xl text-muted-foreground leading-relaxed max-w-xl"
              style={{ animationDelay: "240ms" }}
            >
              Professor of Computer Engineering and AI researcher, leading the
              company that runs the Federal Government of Nigeria&apos;s
              digital infrastructure.
            </p>
            <div
              className="animate-fade-up mt-9 flex flex-wrap gap-3"
              style={{ animationDelay: "360ms" }}
            >
              <Button
                size="lg"
                className="h-12 rounded-full px-7 text-sm font-bold"
                nativeButton={false}
                render={<Link href="/impact" />}
              >
                Explore the impact
                <ArrowRight data-icon="inline-end" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-7 text-sm font-bold bg-card"
                nativeButton={false}
                render={<Link href="/recognition" />}
              >
                Awards &amp; recognition
              </Button>
            </div>
            <ul
              className="animate-fade-up mt-10 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground"
              style={{ animationDelay: "480ms" }}
            >
              {["PhD Computing, RGU Aberdeen", "MIT-ETT Fellow", "COREN Engineer"].map((chip) => (
                <li key={chip} className="flex items-center gap-2">
                  <span className="size-1.5 rotate-45 bg-gold" aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <Reveal className="justify-self-center">
            <div className="relative">
              <div
                className="animate-float absolute -inset-4 rounded-[2.5rem] bg-secondary"
                aria-hidden="true"
              />
              <div className="relative rounded-[2rem] overflow-hidden border bg-card shadow-[0_30px_70px_rgba(16,24,40,0.16)]">
                <Image
                  src={hero.src}
                  alt={hero.alt}
                  width={hero.width}
                  height={hero.height}
                  priority
                  sizes="(min-width: 768px) 416px, 100vw"
                  className="w-full object-cover object-top"
                />
              </div>
              <Link
                href="/recognition"
                className="group absolute -bottom-6 -left-8 flex items-center gap-4 rounded-2xl border bg-card px-5 py-4 shadow-lg hover:border-gold/60 transition-colors"
              >
                <span>
                  <span className="block font-heading text-3xl font-medium text-gold-ink">
                    <Counter to={20} suffix="+" />
                  </span>
                  <span className="block text-xs font-semibold text-muted-foreground mt-0.5">
                    awards in two years at GBB
                  </span>
                </span>
                <ArrowUpRight
                  className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold-ink"
                  aria-hidden="true"
                />
              </Link>
            </div>
          </Reveal>
        </div>

        {/* Marquee */}
        <div aria-hidden="true" className="relative py-5 border-y bg-card overflow-hidden">
          <div className="marquee-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {marquee.map((item) => (
                  <span key={item} className="flex items-center">
                    <span className="font-heading text-lg italic text-muted-foreground whitespace-nowrap px-8">
                      {item}
                    </span>
                    <span className="size-1.5 rotate-45 bg-gold/70 shrink-0" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ STATS BAND ============================ */}
      <section className="relative bg-ink text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(29,78,216,0.3),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
              {stats.map((s) => (
                <div key={s.id} className="border-t border-white/20 pt-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="font-heading text-5xl md:text-6xl font-medium tracking-tight">
                    <Counter to={s.value} suffix={s.suffix} />
                  </dd>
                  <p className="mt-3 text-sm text-white/70 leading-snug max-w-[16rem]">
                    {s.label}
                  </p>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ============================ PROFILE ============================ */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-[1.1fr_0.9fr] gap-16 items-center">
          <Reveal>
            <SectionHeading
              kicker="Profile"
              title={
                <>
                  A scholar at the helm of <Accent>national infrastructure</Accent>
                </>
              }
            />
            <div className="mt-8 flex flex-col gap-5 text-muted-foreground leading-relaxed text-lg max-w-xl">
              <p>
                Before Abuja, there was Aberdeen — and before that, Ogbomoso.
                Prof. Adeyanju graduated top of his class at LAUTECH, earned a
                PhD in Computing at Robert Gordon University, and taught at
                MIT as an Empowering the Teachers fellow before rising to
                Professor of Intelligent Systems at Federal University
                Oye-Ekiti.
              </p>
              <p>
                Today he applies that same rigour to Galaxy Backbone Limited —
                the company entrusted with Nigeria&apos;s sovereign cloud,
                national fibre backbone and the digital services used across
                the entire federal government.
              </p>
            </div>
            <blockquote className="mt-9 border-l-[3px] border-gold pl-6 py-1">
              <p className="text-2xl italic leading-snug text-foreground">
                &ldquo;The quiet architecture of Nigeria&apos;s digital
                future.&rdquo;
              </p>
              <cite className="mt-3 block font-mono text-[0.72rem] uppercase tracking-[0.16em] text-muted-foreground not-italic">
                BusinessDay, on Galaxy Backbone at 20
              </cite>
            </blockquote>
            <Button
              size="lg"
              variant="outline"
              className="mt-9 h-12 rounded-full px-7 text-sm font-bold bg-card"
              nativeButton={false}
              render={<Link href="/about" />}
            >
              More about him
              <ArrowRight data-icon="inline-end" />
            </Button>
          </Reveal>

          <Reveal delay={150} className="justify-self-center">
            <figure className="relative max-w-xs">
              <div
                className="absolute -inset-3 rounded-[2rem] border-2 border-dashed border-primary/25 -rotate-2"
                aria-hidden="true"
              />
              <Image
                src={profile.src}
                alt={profile.alt}
                width={profile.width}
                height={profile.height}
                sizes="(min-width: 768px) 300px, 80vw"
                className="relative rounded-[1.6rem] w-full object-cover shadow-[0_25px_50px_rgba(16,24,40,0.15)]"
              />
              <figcaption className="mt-5 text-center font-mono text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">
                {profile.caption ?? "MIT Empowering the Teachers fellow — Cambridge, 2014"}
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ============================ RECOGNITION ============================ */}
      {leadAward && (
        <section className="relative py-24 bg-card border-y overflow-hidden">
          <div
            className="absolute inset-x-0 top-0 h-96 bg-[radial-gradient(ellipse_at_top_left,rgba(195,154,62,0.10),transparent_60%)]"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
                  kicker="Recognition"
                  title={
                    <>
                      The latest <Accent>honours</Accent>
                    </>
                  }
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6 text-sm font-bold bg-card"
                  nativeButton={false}
                  render={<Link href="/recognition" />}
                >
                  All awards
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </Reveal>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              <Reveal className="lg:col-span-2 h-full">
                <AwardCard award={leadAward} featured />
              </Reveal>
              {moreAwards.slice(0, 1).map((award) => (
                <Reveal key={award.id} delay={120} className="h-full">
                  <AwardCard award={award} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================ LEADERSHIP ============================ */}
      <section className="relative py-24 overflow-hidden">
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Leadership at GBB"
              title={
                <>
                  Two years of <Accent>purposeful delivery</Accent>
                </>
              }
              intro="Since February 2024, the Integrated Digital Transformation Strategy has repositioned Galaxy Backbone as one of Nigeria's most strategic digital institutions."
            />
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-14 items-center">
            <Reveal>
              <figure className="relative rounded-[2rem] overflow-hidden border shadow-[0_25px_60px_rgba(16,24,40,0.14)]">
                <Image
                  src={team.src}
                  alt={team.alt}
                  width={team.width}
                  height={team.height}
                  sizes="(min-width: 768px) 50vw, 100vw"
                  className="w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <figcaption className="absolute bottom-5 left-6 right-6 text-sm font-semibold text-white">
                  {team.caption ?? "With Galaxy Backbone's executive management team, Abuja."}
                </figcaption>
              </figure>
            </Reveal>

            <div>
              <ul className="divide-y border-y">
                {initiatives.slice(0, 4).map((item, i) => {
                  const Icon = resolveIcon(item.icon);
                  return (
                    <li key={item.id}>
                      <Reveal delay={i * 80}>
                        <Link
                          href={item.href}
                          className="group flex gap-5 py-6 pr-2"
                        >
                          <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <Icon className="size-5" aria-hidden="true" />
                          </span>
                          <span className="grow">
                            <span className="block font-heading text-xl font-medium group-hover:text-primary transition-colors duration-200">
                              {item.title}
                            </span>
                            <span className="mt-1.5 block text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {item.summary}
                            </span>
                          </span>
                          <ArrowRight
                            className="mt-1.5 size-4 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-1"
                            aria-hidden="true"
                          />
                        </Link>
                      </Reveal>
                    </li>
                  );
                })}
              </ul>
              <Reveal delay={320}>
                <Button
                  size="lg"
                  className="mt-8 h-12 rounded-full px-7 text-sm font-bold"
                  nativeButton={false}
                  render={<Link href="/impact#initiatives" />}
                >
                  See every initiative
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ RESEARCH ============================ */}
      <section className="relative py-24 bg-card border-y">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                kicker="Research & Academia"
                title={
                  <>
                    <Accent>970+ citations</Accent>, two decades of enquiry
                  </>
                }
              />
              <Button
                size="lg"
                variant="outline"
                className="h-12 rounded-full px-6 text-sm font-bold bg-card"
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
          </Reveal>

          <div className="mt-12 grid sm:grid-cols-2 gap-x-14">
            {research.map((r, i) => (
              <Reveal key={r.id} delay={(i % 2) * 100}>
                <div className="border-t py-7">
                  <h3 className="text-2xl font-medium">{r.area}</h3>
                  <p className="mt-2 text-muted-foreground leading-relaxed">
                    {r.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRESS ============================ */}
      {press.length > 0 && (
        <section className="relative py-24">
          <div className="mx-auto max-w-6xl px-6">
            <Reveal>
              <div className="flex flex-wrap items-end justify-between gap-6">
                <SectionHeading
                  kicker="In the Press"
                  title={
                    <>
                      What the papers <Accent>say</Accent>
                    </>
                  }
                />
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 rounded-full px-6 text-sm font-bold bg-card"
                  nativeButton={false}
                  render={<Link href="/recognition#press" />}
                >
                  All coverage
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </div>
            </Reveal>

            <ul className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {press.slice(0, 3).map((item, i) => (
                <li key={item.id}>
                  <Reveal delay={i * 80} className="h-full">
                    <PressCard item={item} />
                  </Reveal>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ============================ EXPLORE INDEX ============================ */}
      <section className="relative py-24 pb-32 bg-card border-t">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Explore"
              title={
                <>
                  Get to know <Accent>the Professor</Accent>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 border-t">
            {explore.map((e, i) => (
              <Reveal key={e.href} delay={i * 50}>
                <Link
                  href={e.href}
                  className="group flex items-center gap-6 md:gap-10 border-b py-7 px-2 transition-colors duration-200 hover:bg-accent/60"
                >
                  <div className="grow">
                    <h3 className="text-3xl md:text-4xl font-medium tracking-tight group-hover:text-primary transition-colors duration-200">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">{e.desc}</p>
                  </div>
                  <ArrowRight
                    className="size-6 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-2"
                    aria-hidden="true"
                  />
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
