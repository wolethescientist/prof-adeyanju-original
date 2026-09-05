import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { mediaUrl } from "@/lib/cms/media-url";
import { SLOTS, type ResolvedImage } from "@/lib/cms/slots";
import {
  awards,
  educationEntries,
  glanceItems,
  honours,
  impactStats,
  initiatives,
  marqueeItems,
  pressItems,
  researchAreas,
  siteImages,
  stats,
  timelineEntries,
} from "@/db/schema";

/**
 * Read side of the CMS: what the public pages call instead of importing the
 * old hardcoded arrays.
 *
 * Every getter returns only published rows, in the order the media team set.
 * The pages that use these are statically rendered and revalidated on demand,
 * so reads do not hit the database on each visit — see `revalidates` in
 * lib/cms/registry.ts.
 */

export { mediaUrl } from "@/lib/cms/media-url";

/**
 * Resolves every page-image slot to something renderable.
 *
 * A slot falls back to the photograph the site shipped with whenever the team
 * has not chosen one, or has deleted the image it pointed at — so the layouts
 * can render unconditionally and never end up with a hole.
 */
export async function getSiteImages(): Promise<Record<string, ResolvedImage>> {
  const rows = await db.query.siteImages.findMany({
    with: {
      image: {
        columns: { id: true, checksum: true, alt: true, width: true, height: true },
      },
    },
  });

  const bySlot = new Map(rows.map((row) => [row.slot, row]));

  return Object.fromEntries(
    SLOTS.map((slot) => {
      const row = bySlot.get(slot.slot);
      const image = row?.image;
      const url = mediaUrl(image);

      if (!image || !url) {
        return [
          slot.slot,
          { ...slot.fallback, caption: row?.caption ?? null },
        ] as const;
      }

      return [
        slot.slot,
        {
          src: url,
          alt: image.alt || slot.fallback.alt,
          /* Fall back to the design's dimensions if the upload's could not be
             read, so space is still reserved and nothing shifts. */
          width: image.width ?? slot.fallback.width,
          height: image.height ?? slot.fallback.height,
          caption: row?.caption ?? null,
        },
      ] as const;
    })
  );
}

export async function getStats() {
  return db
    .select({
      id: stats.id,
      value: stats.value,
      suffix: stats.suffix,
      label: stats.label,
    })
    .from(stats)
    .where(eq(stats.published, true))
    .orderBy(asc(stats.position));
}

/** The Impact page keeps its own counters, independent of the home page. */
export async function getImpactStats() {
  return db
    .select({
      id: impactStats.id,
      value: impactStats.value,
      suffix: impactStats.suffix,
      label: impactStats.label,
    })
    .from(impactStats)
    .where(eq(impactStats.published, true))
    .orderBy(asc(impactStats.position));
}

export async function getMarquee() {
  const rows = await db
    .select({ text: marqueeItems.text })
    .from(marqueeItems)
    .where(eq(marqueeItems.published, true))
    .orderBy(asc(marqueeItems.position));
  return rows.map((r) => r.text);
}

export async function getTimeline() {
  return db
    .select({
      id: timelineEntries.id,
      period: timelineEntries.period,
      title: timelineEntries.title,
      org: timelineEntries.org,
      detail: timelineEntries.detail,
    })
    .from(timelineEntries)
    .where(eq(timelineEntries.published, true))
    .orderBy(asc(timelineEntries.position));
}

export async function getInitiatives() {
  return db.query.initiatives.findMany({
    where: eq(initiatives.published, true),
    orderBy: asc(initiatives.position),
    with: { image: { columns: { id: true, checksum: true, alt: true } } },
  });
}

export async function getResearchAreas() {
  return db
    .select({
      id: researchAreas.id,
      area: researchAreas.area,
      detail: researchAreas.detail,
    })
    .from(researchAreas)
    .where(eq(researchAreas.published, true))
    .orderBy(asc(researchAreas.position));
}

export async function getEducation() {
  return db
    .select({
      id: educationEntries.id,
      years: educationEntries.years,
      degree: educationEntries.degree,
      school: educationEntries.school,
      href: educationEntries.href,
      description: educationEntries.description,
    })
    .from(educationEntries)
    .where(eq(educationEntries.published, true))
    .orderBy(asc(educationEntries.position));
}

export async function getHonours() {
  return db
    .select({
      id: honours.id,
      text: honours.text,
      description: honours.description,
    })
    .from(honours)
    .where(eq(honours.published, true))
    .orderBy(asc(honours.position));
}

export async function getAwards() {
  return db.query.awards.findMany({
    where: eq(awards.published, true),
    orderBy: asc(awards.position),
    with: { image: { columns: { id: true, checksum: true, alt: true } } },
  });
}

export async function getPress() {
  return db.query.pressItems.findMany({
    where: eq(pressItems.published, true),
    orderBy: asc(pressItems.position),
    with: { image: { columns: { id: true, checksum: true, alt: true } } },
  });
}

export async function getGlance() {
  return db
    .select({
      id: glanceItems.id,
      label: glanceItems.label,
      value: glanceItems.value,
    })
    .from(glanceItems)
    .where(eq(glanceItems.published, true))
    .orderBy(asc(glanceItems.position));
}
