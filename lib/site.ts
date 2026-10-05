/**
 * Facts about the site and the person it is about, in one place. Search
 * engines read them as structured data, and the sitemap, canonical addresses
 * and sharing cards are built from the address here.
 */

/** The public address, without a trailing slash. Set NEXT_PUBLIC_SITE_URL to change it. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.ibrahimadeyanju.com").replace(
  /\/+$/,
  ""
);

export const SITE_NAME = "Prof. Ibrahim Adepoju Adeyanju";

export const SITE_DESCRIPTION =
  "Professor of Computer Engineering, AI researcher and Managing Director/CEO of Galaxy Backbone Limited, leading Nigeria's federal digital infrastructure.";

/** An absolute address for a path on this site. */
export function absoluteUrl(path = "/") {
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Where else he appears on the web. Search engines use these to connect the profiles. */
export const PROFILE_LINKS = [
  "https://www.linkedin.com/in/ibrahim-adeyanju-phd-6a5b7816/",
  "https://scholar.google.com/citations?user=Z97RmFAAAAAJ",
  "https://galaxybackbone.com.ng/management/professor-ibrahim-adepoju-adeyanju-managing-director-chief-executive-officer/",
  "https://mitettfellows.org/fellow/prof-ibrahim-adeyanju/",
  "https://fuoye.edu.ng/members/ibrahim-adeyanju/",
];

export const PERSON = {
  name: "Ibrahim Adepoju Adeyanju",
  honorificPrefix: "Prof.",
  alternateName: ["Ibrahim Adeyanju", "Prof. Ibrahim Adeyanju", "I.A. Adeyanju"],
  jobTitle: "Managing Director/CEO, Galaxy Backbone Limited",
  image: "/images/adeyanju-portrait.jpg",
} as const;
