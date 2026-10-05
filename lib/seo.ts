import type { Metadata } from "next";
import { SITE_NAME } from "./site";

/** The site-wide sharing card (app/opengraph-image.tsx). */
export const DEFAULT_SHARE_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Prof. Ibrahim Adepoju Adeyanju, MD/CEO, Galaxy Backbone Limited",
};

/**
 * Metadata for an ordinary page: its own title and description, its canonical
 * address, and matching sharing cards. (A page that sets `openGraph` replaces
 * the site-wide one, so the shared fields are repeated here.)
 */
export function pageMetadata({
  title,
  description,
  path,
}: {
  /** Without the site name; the layout's template adds it. */
  title: string;
  description: string;
  path: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale: "en_NG",
      url: path,
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_SHARE_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [DEFAULT_SHARE_IMAGE.url],
    },
  };
}
