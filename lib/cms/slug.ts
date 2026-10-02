/**
 * Turns a title into the address segment of an article's page:
 * "Best IT Service Provider of the Year" → "best-it-service-provider-of-the-year".
 *
 * Lower-case letters and digits joined by hyphens, cut at a word boundary
 * within 60 characters. db/migrations/0002_articles.sql applies the same rule
 * to the rows that existed before articles did, so keep the two in step.
 */
export function slugify(title: string, fallback = "article") {
  const full = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "") // é → e
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const cut =
    full.length <= 60
      ? full
      : full.slice(0, 61).replace(/-[^-]*$/, "").replace(/^-+|-+$/g, "");

  return cut || fallback;
}
