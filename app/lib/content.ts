import "server-only";

import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
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

/** URL for an uploaded image. The checksum makes it safely cacheable forever. */
export function mediaUrl(
  image: { id: string; checksum: string } | null | undefined
) {
  return image ? `/api/media/${image.id}?v=${image.checksum.slice(0, 12)}` : null;
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
    })
    .from(educationEntries)
    .where(eq(educationEntries.published, true))
    .orderBy(asc(educationEntries.position));
}

export async function getHonours() {
  return db
    .select({ id: honours.id, text: honours.text })
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
