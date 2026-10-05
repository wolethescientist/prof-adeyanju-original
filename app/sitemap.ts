import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { initiatives, newsItems } from "@/db/schema";
import { EVENT, registrationClosed } from "@/lib/event";
import { absoluteUrl } from "@/lib/site";

/* Saving in the CMS refreshes this (see `refresh` in the content actions), so
   a new post is listed within moments; this is the safety net. */
export const revalidate = 3600;

const PAGES: { path: string; changeFrequency: "daily" | "weekly" | "monthly"; priority: number }[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/news", changeFrequency: "daily", priority: 0.9 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/impact", changeFrequency: "monthly", priority: 0.8 },
  { path: "/journey", changeFrequency: "monthly", priority: 0.7 },
  { path: "/research", changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [news, programmes] = await Promise.all([
    db
      .select({ slug: newsItems.slug, updatedAt: newsItems.updatedAt })
      .from(newsItems)
      .where(eq(newsItems.published, true)),
    db
      .select({ slug: initiatives.slug, updatedAt: initiatives.updatedAt })
      .from(initiatives)
      .where(eq(initiatives.published, true)),
  ]);

  return [
    /* The registration page is listed while people can still register. */
    ...(registrationClosed()
      ? []
      : [{ url: absoluteUrl(EVENT.path), changeFrequency: "weekly" as const, priority: 0.8 }]),
    ...PAGES.map((page) => ({
      url: absoluteUrl(page.path),
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    ...news.map((item) => ({
      url: absoluteUrl(`/news/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    ...programmes.map((item) => ({
      url: absoluteUrl(`/impact/initiatives/${item.slug}`),
      lastModified: item.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
