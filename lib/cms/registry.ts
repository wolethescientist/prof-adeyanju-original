import { z } from "zod";
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
import { ICON_NAMES } from "@/app/lib/icons";

/**
 * The registry every admin screen is built from.
 *
 * Rather than hand-writing ten near-identical CRUD pages, each section of the
 * public site is described once here — its table, its fields, and which pages
 * to refresh when it changes — and a single set of generic screens renders
 * them all. Adding a new section to the CMS later means adding one entry to
 * this file, not building another page.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "icon"
  | "image";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  maxLength?: number;
};

export type ContentType = {
  slug: string;
  label: string;
  singular: string;
  description: string;
  /* Grouping for the sidebar/dropdown. */
  group: "Achievements" | "Profile" | "Home page" | "Page images";
  table: TableFor;
  fields: Field[];
  /** Field shown as the headline in the list view. */
  titleField: string;
  /** Optional supporting line in the list view. */
  subtitleField?: string;
  /** Public routes to revalidate after any change here. */
  revalidates: string[];
  /**
   * A fixed set of rows the team edits but cannot add to, reorder or delete —
   * used where the design dictates exactly which slots exist.
   */
  fixed?: boolean;
};

/* The tables all share the columns the generic screens rely on (id, position,
   published, updatedAt), which this union documents. */
type TableFor =
  | typeof awards
  | typeof pressItems
  | typeof timelineEntries
  | typeof initiatives
  | typeof researchAreas
  | typeof educationEntries
  | typeof honours
  | typeof stats
  | typeof impactStats
  | typeof siteImages
  | typeof glanceItems
  | typeof marqueeItems;

export const CONTENT_TYPES: ContentType[] = [
  {
    slug: "awards",
    label: "Awards & Achievements",
    singular: "Award",
    description:
      "Awards won by Galaxy Backbone under his leadership. Shown on the Recognition page.",
    group: "Achievements",
    table: awards,
    titleField: "award",
    subtitleField: "year",
    revalidates: ["/recognition", "/"],
    fields: [
      {
        name: "award",
        label: "Award name",
        type: "text",
        required: true,
        maxLength: 300,
        placeholder: "Best IT Service Provider Company of the Year",
      },
      {
        name: "year",
        label: "Year",
        type: "text",
        required: true,
        maxLength: 20,
        placeholder: "2025",
      },
      {
        name: "detail",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        help: "Optional. A sentence or two about what the award recognises.",
      },
      {
        name: "imageId",
        label: "Photo or certificate",
        type: "image",
        help: "Optional. A photo of the award presentation or the certificate.",
      },
    ],
  },
  {
    slug: "press",
    label: "Press coverage",
    singular: "Press item",
    description:
      "News articles and interviews. Shown on the Recognition page and the home page.",
    group: "Achievements",
    table: pressItems,
    titleField: "title",
    subtitleField: "outlet",
    revalidates: ["/recognition", "/"],
    fields: [
      {
        name: "outlet",
        label: "Publication",
        type: "text",
        required: true,
        maxLength: 100,
        placeholder: "BusinessDay",
      },
      {
        name: "title",
        label: "Headline",
        type: "text",
        required: true,
        maxLength: 400,
        placeholder: "Galaxy Backbone at 20: The Quiet Architecture...",
      },
      {
        name: "href",
        label: "Link to the article",
        type: "url",
        required: true,
        placeholder: "https://businessday.ng/...",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        placeholder: "A sentence of context about this coverage.",
        help: "Optional. Shown on the website beneath this entry.",
      },
      {
        name: "imageId",
        label: "Image",
        type: "image",
        help: "Optional.",
      },
    ],
  },
  {
    slug: "initiatives",
    label: "Initiatives",
    singular: "Initiative",
    description:
      "Flagship programmes such as 1Government Cloud and Project 774. Shown on the Impact page.",
    group: "Achievements",
    table: initiatives,
    titleField: "title",
    revalidates: ["/impact", "/"],
    fields: [
      {
        name: "title",
        label: "Initiative name",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "1Government Cloud",
      },
      {
        name: "detail",
        label: "Description",
        type: "textarea",
        required: true,
        maxLength: 1000,
      },
      {
        name: "icon",
        label: "Icon",
        type: "icon",
        required: true,
        help: "Shown beside the initiative in some layouts.",
      },
      { name: "imageId", label: "Image", type: "image", help: "Optional." },
    ],
  },
  {
    slug: "impact-stats",
    label: "Impact numbers",
    singular: "Number",
    description:
      "The four counters across the top of the Impact page. Separate from the home page's headline numbers.",
    group: "Achievements",
    table: impactStats,
    titleField: "label",
    revalidates: ["/impact"],
    fields: [
      {
        name: "value",
        label: "Number",
        type: "number",
        required: true,
        help: "Digits only — it counts up to this figure.",
        placeholder: "9",
      },
      {
        name: "suffix",
        label: "Suffix",
        type: "text",
        maxLength: 10,
        placeholder: "K+",
        help: "Optional, e.g. “+” or “K+”.",
      },
      {
        name: "label",
        label: "Caption",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "underserved LGAs connected so far",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        placeholder: "e.g. where this figure came from, and when it was last checked.",
        help: "Optional. A note for your team — the design has no place to show it, so visitors will not see it.",
      },
    ],
  },
  {
    slug: "timeline",
    label: "Career journey",
    singular: "Chapter",
    description: "The chapters of his career, shown on the Journey page.",
    group: "Profile",
    table: timelineEntries,
    titleField: "title",
    subtitleField: "period",
    revalidates: ["/journey"],
    fields: [
      {
        name: "period",
        label: "Period",
        type: "text",
        required: true,
        maxLength: 60,
        placeholder: "February 2024 — present",
      },
      {
        name: "title",
        label: "Role or qualification",
        type: "text",
        required: true,
        maxLength: 300,
      },
      {
        name: "org",
        label: "Organisation",
        type: "text",
        required: true,
        maxLength: 300,
      },
      {
        name: "detail",
        label: "Description",
        type: "textarea",
        required: true,
        maxLength: 1200,
      },
    ],
  },
  {
    slug: "research",
    label: "Research areas",
    singular: "Research area",
    description: "Fields of research, shown on the Research page.",
    group: "Profile",
    table: researchAreas,
    titleField: "area",
    revalidates: ["/research", "/"],
    fields: [
      {
        name: "area",
        label: "Area",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "Natural Language Processing",
      },
      {
        name: "detail",
        label: "Description",
        type: "textarea",
        required: true,
        maxLength: 1000,
      },
    ],
  },
  {
    slug: "education",
    label: "Education",
    singular: "Qualification",
    description: "Degrees and academic posts, shown on the About page.",
    group: "Profile",
    table: educationEntries,
    titleField: "degree",
    subtitleField: "school",
    revalidates: ["/about"],
    fields: [
      {
        name: "years",
        label: "Years",
        type: "text",
        required: true,
        maxLength: 60,
        placeholder: "2007 — 2011",
      },
      {
        name: "degree",
        label: "Qualification",
        type: "text",
        required: true,
        maxLength: 300,
      },
      {
        name: "school",
        label: "Institution",
        type: "text",
        required: true,
        maxLength: 300,
      },
      {
        name: "href",
        label: "Institution website",
        type: "url",
        help: "Optional. The row links here.",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        placeholder: "Thesis title, distinction, or anything worth adding.",
        help: "Optional. Shown on the website beneath this entry.",
      },
    ],
  },
  {
    slug: "honours",
    label: "Personal honours",
    singular: "Honour",
    description:
      "Fellowships, scholarships and personal recognition. Shown on the Recognition page.",
    group: "Achievements",
    table: honours,
    titleField: "text",
    revalidates: ["/recognition"],
    fields: [
      {
        name: "text",
        label: "Honour",
        type: "textarea",
        required: true,
        maxLength: 400,
        placeholder: "Fellow, Nigerian Young Academy (NYA)",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        placeholder: "What the honour recognises, or the year it was awarded.",
        help: "Optional. Shown on the website beneath this entry.",
      },
    ],
  },
  {
    slug: "stats",
    label: "Headline numbers",
    singular: "Number",
    description:
      "The large animated counters in the dark band on the home page only.",
    group: "Home page",
    table: stats,
    titleField: "label",
    revalidates: ["/"],
    fields: [
      {
        name: "value",
        label: "Number",
        type: "number",
        required: true,
        help: "Digits only — it counts up to this figure.",
        placeholder: "100",
      },
      {
        name: "suffix",
        label: "Suffix",
        type: "text",
        maxLength: 10,
        placeholder: "K+",
        help: "Optional, e.g. “+” or “K+”.",
      },
      {
        name: "label",
        label: "Caption",
        type: "text",
        required: true,
        maxLength: 200,
        placeholder: "Federal professionals on GovMail",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        placeholder: "e.g. where this figure came from, and when it was last checked.",
        help: "Optional. A note for your team — the design has no place to show it, so visitors will not see it.",
      },
    ],
  },
  {
    slug: "glance",
    label: "At a glance",
    singular: "Row",
    description: "The summary card on the About page.",
    group: "Profile",
    table: glanceItems,
    titleField: "label",
    subtitleField: "value",
    revalidates: ["/about"],
    fields: [
      {
        name: "label",
        label: "Label",
        type: "text",
        required: true,
        maxLength: 60,
        placeholder: "Current role",
      },
      {
        name: "value",
        label: "Value",
        type: "text",
        required: true,
        maxLength: 300,
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        help: "Optional. A note for your team — the design has no place to show it, so visitors will not see it.",
      },
    ],
  },
  {
    slug: "page-images",
    label: "Page images",
    singular: "Image slot",
    description:
      "The photographs built into the page designs. Choose which uploaded image fills each place — you cannot add or remove slots.",
    group: "Page images",
    table: siteImages,
    titleField: "label",
    fixed: true,
    revalidates: ["/", "/impact", "/research"],
    fields: [
      {
        name: "imageId",
        label: "Image",
        type: "image",
        help: "Leave empty to use the photograph the site originally shipped with.",
      },
      {
        name: "caption",
        label: "Caption",
        type: "text",
        maxLength: 300,
        help: "Optional. Only shown where the design has a caption.",
      },
    ],
  },
  {
    slug: "marquee",
    label: "Scrolling keywords",
    singular: "Keyword",
    description: "The moving strip of keywords under the hero on the home page.",
    group: "Home page",
    table: marqueeItems,
    titleField: "text",
    revalidates: ["/"],
    fields: [
      {
        name: "text",
        label: "Keyword",
        type: "text",
        required: true,
        maxLength: 60,
        placeholder: "1Government Cloud",
      },
      {
        name: "description",
        label: "Description",
        type: "textarea",
        maxLength: 1000,
        help: "Optional. A note for your team — the design has no place to show it, so visitors will not see it.",
      },
    ],
  },
];

export function getContentType(slug: string): ContentType | undefined {
  return CONTENT_TYPES.find((t) => t.slug === slug);
}

/** Builds a Zod schema for one content type from its field descriptors. */
export function schemaFor(type: ContentType) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of type.fields) {
    let rule: z.ZodTypeAny;

    switch (field.type) {
      case "number": {
        rule = z.coerce
          .number({ error: `${field.label} must be a number.` })
          .int(`${field.label} must be a whole number.`)
          .min(0, `${field.label} cannot be negative.`);
        break;
      }
      case "url": {
        const url = z
          .url({ error: `${field.label} must be a full URL starting with https://` })
          .max(2000);
        rule = field.required ? url : url.or(z.literal("")).nullable();
        break;
      }
      case "image": {
        /* An empty select posts "", which means "no image". */
        rule = z.uuid().or(z.literal("")).nullable();
        break;
      }
      case "icon": {
        rule = z.enum(ICON_NAMES as [string, ...string[]]);
        break;
      }
      default: {
        const text = z.string().max(
          field.maxLength ?? 2000,
          `${field.label} must be ${field.maxLength ?? 2000} characters or fewer.`
        );
        rule = field.required
          ? text.trim().min(1, `${field.label} is required.`)
          : text.nullable();
      }
    }

    shape[field.name] = rule;
  }

  shape.published = z.coerce.boolean();
  return z.object(shape);
}
