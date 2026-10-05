import { CalendarDays, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/app/components/JsonLd";
import Reveal from "@/app/components/Reveal";
import { PageHeader } from "@/app/components/ui";
import { EVENT, registrationClosed } from "@/lib/event";
import { pageMetadata } from "@/lib/seo";
import { PERSON, absoluteUrl } from "@/lib/site";
import { breadcrumbSchema } from "@/lib/structured-data";
import RegisterForm from "./register-form";

export const metadata: Metadata = pageMetadata({
  title: `Register: ${EVENT.name}`,
  description: `Register to attend the ${EVENT.title} on ${EVENT.dateLabel} at ${EVENT.venue}, ${EVENT.place}.`,
  path: EVENT.path,
});

/* Checked hourly, so the page switches to "closed" soon after the lecture. */
export const revalidate = 3600;

export default function RegisterPage() {
  const closed = registrationClosed();

  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: EVENT.title,
    startDate: EVENT.date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: EVENT.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Oye-Ekiti",
        addressRegion: "Ekiti State",
        addressCountry: "NG",
      },
    },
    performer: { "@id": absoluteUrl("/#person"), "@type": "Person", name: PERSON.name },
    image: [absoluteUrl(PERSON.image)],
    url: absoluteUrl(EVENT.path),
  };

  return (
    <>
      <JsonLd
        data={[eventSchema, breadcrumbSchema([{ name: `Register: ${EVENT.name}`, path: EVENT.path }])]}
      />
      <PageHeader
        kicker="Event registration"
        title={EVENT.title}
        intro="Register your attendance below. It takes a minute."
      />

      <section className="py-14">
        <div className="mx-auto grid max-w-6xl items-start gap-10 px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
          <Reveal>
            <div className="rounded-2xl border bg-card p-7">
              <h2 className="text-xl font-semibold tracking-tight">About the event</h2>
              <dl className="mt-6 flex flex-col gap-5">
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <CalendarDays className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm text-muted-foreground">Date</dt>
                    <dd className="mt-0.5 font-semibold">{EVENT.dateLabel}</dd>
                  </div>
                </div>
                <div className="flex gap-4">
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary text-primary">
                    <MapPin className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <dt className="text-sm text-muted-foreground">Venue</dt>
                    <dd className="mt-0.5 font-semibold">{EVENT.venue}</dd>
                    <dd className="text-sm text-muted-foreground">{EVENT.place}</dd>
                  </div>
                </div>
              </dl>
              <Link
                href={EVENT.announcementPath}
                className="mt-7 inline-block text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                Read the announcement
              </Link>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="rounded-2xl border bg-card p-7 md:p-9">
              {closed ? (
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight">Registration has closed</h2>
                  <p className="mt-3 leading-relaxed text-muted-foreground">
                    The {EVENT.name} took place on {EVENT.dateLabel}. Thank you to everyone who
                    registered.
                  </p>
                </div>
              ) : (
                <>
                  <h2 className="mb-6 text-2xl font-semibold tracking-tight">Register to attend</h2>
                  <RegisterForm />
                </>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
