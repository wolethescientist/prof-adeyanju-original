import "server-only";

import sanitizeHtml from "sanitize-html";

/**
 * The only HTML an article body may contain: what the CMS editor's toolbar
 * can produce, and nothing else.
 *
 * The body is written by signed-in staff, but it is still rendered into the
 * public site as HTML, so it is cleaned on save (anything pasted in from Word
 * or a web page loses its styling, scripts and embeds) and again on render.
 */
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [
    "p",
    "br",
    "h2",
    "h3",
    "strong",
    "em",
    "u",
    "s",
    "a",
    "ul",
    "ol",
    "li",
    "blockquote",
    "hr",
  ],
  /* target and rel are set by the transform below, never taken from input. */
  allowedAttributes: { a: ["href", "target", "rel"] },
  allowedSchemes: ["http", "https", "mailto"],
  /* Links in an article leave the site; open them safely in a new tab. */
  transformTags: {
    a: sanitizeHtml.simpleTransform("a", {
      target: "_blank",
      rel: "noopener noreferrer",
    }),
    /* Pasted headings at levels the design doesn't use become its two. */
    h1: "h2",
    h4: "h3",
    h5: "h3",
    h6: "h3",
    b: "strong",
    i: "em",
  },
  exclusiveFilter: (frame) =>
    /* Drop the empty paragraphs editors and pasted documents leave behind. */
    frame.tag === "p" && !frame.text.trim() && !frame.mediaChildren.length,
};

export function cleanRichText(html: string | null | undefined): string {
  if (!html) return "";
  return sanitizeHtml(html, OPTIONS).trim();
}

/** True when the body has any actual words in it, not just empty markup. */
export function hasText(html: string | null | undefined) {
  if (!html) return false;
  return sanitizeHtml(html, { allowedTags: [], allowedAttributes: {} }).trim().length > 0;
}

const ENTITIES: Record<string, string> = {
  "&amp;": "&",
  "&lt;": "<",
  "&gt;": ">",
  "&quot;": '"',
  "&#39;": "'",
  "&nbsp;": " ",
};

/** Plain text, for meta descriptions and the like. */
export function plainText(html: string | null | undefined) {
  if (!html) return "";
  /* Keep a space where one block ends and the next begins. */
  const spaced = html.replace(/<\/(p|h2|h3|li|blockquote)>|<br\s*\/?>/g, " ");
  return sanitizeHtml(spaced, { allowedTags: [], allowedAttributes: {} })
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (entity) => ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();
}
