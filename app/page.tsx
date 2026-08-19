import { ArrowRight, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Counter from "./components/Counter";
import Reveal from "./components/Reveal";
import { SectionHeading } from "./components/ui";
import { initiatives, marquee, press, research, stats } from "./lib/data";

const explore = [
  { href: "/about", title: "About", desc: "The scholar leading Nigeria's federal digital infrastructure." },
  { href: "/journey", title: "Journey", desc: "From a First Class at LAUTECH to MD/CEO — six chapters." },
  { href: "/impact", title: "Impact", desc: "1Government Cloud, GovMail, Project 774 and more." },
  { href: "/research", title: "Research", desc: "AI, machine learning and African language technology." },
  { href: "/recognition", title: "Recognition", desc: "Honours, awards and national press coverage." },
  { href: "#contact", title: "Contact", desc: "Speaking engagements, partnerships and media enquiries." },
];

export default function Home() {
  return (
    <>
      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden">
        <div className="dotgrid absolute inset-0" aria-hidden="true" />
        <div
          className="animate-glow absolute inset-x-0 top-0 h-[40rem] bg-[radial-gradient(ellipse_at_top_right,rgba(29,78,216,0.12),transparent_60%)]"
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-40 pb-24 grid md:grid-cols-[1.1fr_0.9fr] gap-14 items-center">
          <div>
            <h1
              className="animate-fade-up text-5xl md:text-7xl font-bold tracking-tight leading-[1.04]"
              style={{ animationDelay: "120ms" }}
            >
              Prof. Ibrahim
              <br />
              Adepoju <span className="text-primary">Adeyanju</span>
            </h1>
            <p
              className="animate-fade-up mt-7 text-lg text-muted-foreground leading-relaxed max-w-xl font-medium"
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
                render={<Link href="/journey" />}
              >
                The journey
              </Button>
            </div>
            <ul
              className="animate-fade-up mt-10 flex flex-wrap gap-2"
              style={{ animationDelay: "480ms" }}
            >
              {["PhD Computing, RGU Aberdeen", "MIT-ETT Fellow", "COREN Engineer"].map((chip) => (
                <li key={chip}>
                  <Badge
                    variant="outline"
                    className="h-auto bg-card px-4 py-1.5 text-xs font-semibold text-muted-foreground"
                  >
                    {chip}
                  </Badge>
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
                  src="/images/adeyanju-portrait.jpg"
                  alt="Official portrait of Prof. Ibrahim Adepoju Adeyanju at the Galaxy Backbone headquarters, Abuja"
                  width={416}
                  height={520}
                  priority
                  quality={80}
                  sizes="(min-width: 768px) 416px, 100vw"
                  className="w-full object-cover object-top"
                />
              </div>
              <div className="absolute -bottom-6 -left-8 rounded-2xl border bg-card px-5 py-4 shadow-lg">
                <p className="text-2xl font-bold text-primary">
                  <Counter to={20} suffix="+" />
                </p>
                <p className="text-xs font-semibold text-muted-foreground mt-0.5">
                  awards in two years at GBB
                </p>
              </div>
            </div>
          </Reveal>
        </div>

        {/* Marquee */}
        <div
          aria-hidden="true"
          className="relative py-5 border-y bg-card overflow-hidden"
        >
          <div className="marquee-track flex w-max items-center">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex items-center shrink-0">
                {marquee.map((item) => (
                  <span key={item} className="flex items-center">
                    <span className="text-sm font-bold uppercase tracking-[0.15em] text-muted-foreground/80 whitespace-nowrap px-8">
                      {item}
                    </span>
                    <span className="size-1.5 rounded-full bg-primary/60 shrink-0" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ STATS BAND ============================ */}
      <section className="relative bg-[#0b1220] text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(29,78,216,0.3),transparent_55%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6 py-20">
          <Reveal>
            <dl className="grid grid-cols-2 lg:grid-cols-4 gap-x-10 gap-y-12">
              {stats.map((s) => (
                <div key={s.label} className="border-t border-white/20 pt-6">
                  <dt className="sr-only">{s.label}</dt>
                  <dd className="text-5xl md:text-6xl font-bold tracking-tight">
                    <Counter to={s.to} suffix={s.suffix} />
                  </dd>
                  <p className="mt-3 text-sm font-medium text-white/70 leading-snug max-w-[16rem]">
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
                  A scholar at the helm of{" "}
                  <span className="text-primary">national infrastructure</span>
                </>
              }
            />
            <div className="mt-8 flex flex-col gap-5 text-muted-foreground leading-relaxed font-medium max-w-xl">
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
            <blockquote className="mt-8 border-l-4 border-primary pl-6 py-1">
              <p className="text-xl font-semibold leading-relaxed text-foreground">
                &ldquo;The quiet architecture of Nigeria&apos;s digital
                future.&rdquo;
              </p>
              <cite className="mt-2 block text-sm font-medium text-muted-foreground not-italic">
                — BusinessDay, on Galaxy Backbone at 20
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
                src="/images/portrait-mit.png"
                alt="Prof. Ibrahim Adeyanju as an MIT Empowering the Teachers fellow"
                width={300}
                height={448}
                className="relative rounded-[1.6rem] w-full object-cover shadow-[0_25px_50px_rgba(16,24,40,0.15)]"
              />
              <figcaption className="mt-4 text-center text-xs font-semibold text-muted-foreground">
                MIT Empowering the Teachers fellow — Cambridge, 2014
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* ============================ LEADERSHIP ============================ */}
      <section className="relative py-24 bg-card border-y overflow-hidden">
        <div
          className="absolute inset-x-0 bottom-0 h-96 bg-[radial-gradient(ellipse_at_bottom_right,rgba(29,78,216,0.07),transparent_60%)]"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Leadership at GBB"
              title={
                <>
                  Two years of{" "}
                  <span className="text-primary">purposeful delivery</span>
                </>
              }
              intro="Since February 2024, the Integrated Digital Transformation Strategy has repositioned Galaxy Backbone as one of Nigeria's most strategic digital institutions."
            />
          </Reveal>

          <div className="mt-14 grid md:grid-cols-2 gap-14 items-center">
            <Reveal>
              <div className="relative rounded-[2rem] overflow-hidden border shadow-[0_25px_60px_rgba(16,24,40,0.14)]">
                <Image
                  src="/images/team-gbb.jpeg"
                  alt="Prof. Ibrahim Adeyanju with Galaxy Backbone's executive management team"
                  width={960}
                  height={641}
                  className="w-full object-cover"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-[#0b1220]/75 via-transparent to-transparent"
                  aria-hidden="true"
                />
                <p className="absolute bottom-5 left-6 right-6 text-sm font-semibold text-white">
                  With Galaxy Backbone&apos;s executive management team, Abuja.
                </p>
              </div>
            </Reveal>

            <div>
              <ol className="divide-y">
                {initiatives.slice(0, 4).map((item, i) => (
                  <Reveal key={item.title} delay={i * 80}>
                    <li className="group flex gap-6 py-6">
                      <span className="text-sm font-bold text-primary/50 pt-1 tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div>
                        <h3 className="text-lg font-bold group-hover:text-primary transition-colors duration-200">
                          {item.title}
                        </h3>
                        <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed font-medium">
                          {item.detail}
                        </p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
              <Reveal delay={320}>
                <Button
                  size="lg"
                  className="mt-8 h-12 rounded-full px-7 text-sm font-bold"
                  nativeButton={false}
                  render={<Link href="/impact" />}
                >
                  See the full impact
                  <ArrowRight data-icon="inline-end" />
                </Button>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ============================ RESEARCH ============================ */}
      <section className="relative py-24">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                kicker="Research & Academia"
                title={
                  <>
                    <span className="text-primary">970+ citations</span>, two
                    decades of enquiry
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
              <Reveal key={r.area} delay={(i % 2) * 100}>
                <div className="border-t py-7">
                  <p className="text-sm font-bold text-primary/50 tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mt-2 text-xl font-bold">{r.area}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed font-medium">
                    {r.detail}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ PRESS ============================ */}
      <section className="relative py-24 bg-card border-y">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="In the Press"
              title={
                <>
                  What the papers <span className="text-primary">say</span>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 border-t">
            {press.map((p, i) => (
              <Reveal key={p.href} delay={i * 60}>
                <a
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-6 border-b py-6 px-2 cursor-pointer transition-colors duration-200 hover:bg-accent/60"
                >
                  <Badge
                    variant="secondary"
                    className="shrink-0 font-bold uppercase tracking-wide"
                  >
                    {p.outlet}
                  </Badge>
                  <p className="grow text-base md:text-lg font-semibold leading-snug group-hover:text-primary transition-colors duration-200">
                    {p.title}
                  </p>
                  <ArrowUpRight
                    className="size-5 shrink-0 text-muted-foreground transition-all duration-200 group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1"
                    aria-hidden="true"
                  />
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ EXPLORE INDEX ============================ */}
      <section className="relative py-24 pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <Reveal>
            <SectionHeading
              kicker="Explore"
              title={
                <>
                  Get to know <span className="text-primary">the Professor</span>
                </>
              }
            />
          </Reveal>

          <div className="mt-12 border-t">
            {explore.map((e, i) => (
              <Reveal key={e.href} delay={i * 50}>
                <Link
                  href={e.href}
                  className="group flex items-center gap-6 md:gap-10 border-b py-7 px-2 cursor-pointer transition-colors duration-200 hover:bg-accent/60"
                >
                  <span className="text-sm font-bold text-primary/50 tabular-nums w-8">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="grow">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight group-hover:text-primary transition-colors duration-200">
                      {e.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground font-medium">
                      {e.desc}
                    </p>
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
