import { PERSON, PROFILE_LINKS, SITE_DESCRIPTION, SITE_NAME, absoluteUrl } from "./site";

const GALAXY_BACKBONE = {
  "@type": "Organization",
  name: "Galaxy Backbone Limited",
  url: "https://galaxybackbone.com.ng",
};

/** Who the site is about. Facts are those in KNOWLEDGE.md. */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": absoluteUrl("/#person"),
    name: PERSON.name,
    honorificPrefix: PERSON.honorificPrefix,
    alternateName: PERSON.alternateName,
    url: absoluteUrl("/"),
    image: absoluteUrl(PERSON.image),
    description: SITE_DESCRIPTION,
    jobTitle: [
      "Managing Director/CEO",
      "Professor of Computer Engineering (Intelligent Systems)",
    ],
    worksFor: GALAXY_BACKBONE,
    affiliation: {
      "@type": "CollegeOrUniversity",
      name: "Federal University Oye-Ekiti",
      url: "https://fuoye.edu.ng",
    },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Ladoke Akintola University of Technology (LAUTECH)" },
      { "@type": "CollegeOrUniversity", name: "Robert Gordon University, Aberdeen" },
    ],
    knowsAbout: [
      "Artificial intelligence",
      "Machine learning",
      "Natural language processing",
      "Information retrieval",
      "Digital infrastructure",
      "Cloud computing",
    ],
    sameAs: PROFILE_LINKS,
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": absoluteUrl("/#website"),
    name: SITE_NAME,
    url: absoluteUrl("/"),
    description: SITE_DESCRIPTION,
    inLanguage: "en",
    publisher: { "@id": absoluteUrl("/#person") },
  };
}

/** The About page, as a profile of the person. */
export function profilePageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: absoluteUrl("/about"),
    name: `About ${SITE_NAME}`,
    mainEntity: { "@id": absoluteUrl("/#person") },
  };
}

/** The trail shown in search results: Home › News & Awards › This post. */
export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** A news item or initiative as an article. */
export function articleSchema(article: {
  type: "NewsArticle" | "Article";
  path: string;
  headline: string;
  description: string;
  image: string | null;
  published?: Date;
  modified: Date;
}) {
  return {
    "@context": "https://schema.org",
    "@type": article.type,
    mainEntityOfPage: absoluteUrl(article.path),
    headline: article.headline.slice(0, 110),
    description: article.description,
    ...(article.image ? { image: [absoluteUrl(article.image)] } : {}),
    ...(article.published ? { datePublished: article.published.toISOString() } : {}),
    dateModified: article.modified.toISOString(),
    author: { "@id": absoluteUrl("/#person") },
    publisher: { "@type": "Person", "@id": absoluteUrl("/#person"), name: PERSON.name },
    inLanguage: "en",
  };
}
