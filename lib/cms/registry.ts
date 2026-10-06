import { z } from "zod";
import {
  AWARD_RECIPIENTS,
  educationEntries,
  glanceItems,
  honours,
  impactStats,
  initiatives,
  marqueeItems,
  newsItems,
  researchAreas,
  siteImages,
  stats,
  timelineEntries,
} from "@/db/schema";
import { ICON_NAMES } from "@/app/lib/icons";
import { NEWS_CATEGORY_INFO, NEWS_CATEGORY_ORDER } from "./news";

/**
 * The registry every admin screen is built from.
 *
 * Rather than hand-writing a dozen near-identical CRUD pages, each section of
 * the public site is described once here — its table, its fields, and which
 * pages to refresh when it changes — and a single set of generic screens
 * renders them all. Adding a new section to the CMS later means adding one
 * entry to this file, not building another page.
 */

export type FieldType =
  | "text"
  | "textarea"
  | "url"
  | "number"
  | "icon"
  | "image"
  /** Formatted article text from the editor. Stored as sanitised HTML. */
  | "richtext"
  /** An ordered list of photos. */
  | "gallery"
  /** A PDF visitors can download. */
  | "attachment"
  | "date"
  /** One of a few fixed options, shown as buttons. */
  | "choice"
  /** A yes/no switch. */
  | "toggle";

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  help?: string;
  maxLength?: number;
  /** For "choice" fields. The first option is the default. */
  options?: { value: string; label: string; help?: string }[];
  /**
   * Show this field only for some choices of another field — e.g. "Awarded
   * to" only when the news item is an award. A field that is hidden is not
   * required and is saved empty, however it was filled in before.
   */
  showWhen?: { field: string; values: string[] };
  /** Per-choice wording for the field that `showWhen` watches (or `watch`). */
  watch?: string;
  labelWhen?: Record<string, string>;
  placeholderWhen?: Record<string, string>;
  /**
   * Article sections lay their form out like the page it produces: the
   * writing in a main column, the facts about it in a side column.
   */
  placement?: "main" | "side";
  /**
   * How a main-column field is set: the title as a headline, the summary as
   * a lead paragraph, the cover photo full width, or "kind" — the choice made
   * first, shown above the rest of the form.
   */
  appearance?: "headline" | "lead" | "cover" | "kind";
};

/** Icons for the sidebar and dashboard, named from lucide-react. */
export type SectionIcon =
  | "Award"
  | "Newspaper"
  | "Rocket"
  | "Gauge"
  | "Medal"
  | "Route"
  | "Microscope"
  | "GraduationCap"
  | "ListChecks"
  | "Hash"
  | "MoveHorizontal"
  | "Images";

export type ContentType = {
  slug: string;
  label: string;
  singular: string;
  description: string;
  icon: SectionIcon;
  /* Grouping for the sidebar/dropdown. */
  group: "News & Awards" | "Impact page" | "About & profile" | "Home page" | "Photos";
  table: TableFor;
  fields: Field[];
  /** Field shown as the headline in the list view. */
  titleField: string;
  /** Optional supporting line in the list view. */
  subtitleField?: string;
  /** Public routes to revalidate after any change here. */
  revalidates: string[];
  /**
   * Entries are articles with their own page at `${path}/${slug}`. The slug
   * is made from `titleField` when the entry is created.
   */
  article?: { path: string };
  /**
   * A fixed set of rows the team edits but cannot add to, reorder or delete —
   * used where the design dictates exactly which slots exist.
   */
  fixed?: boolean;
};

/* The tables all share the columns the generic screens rely on (id, position,
   published, updatedAt), which this union documents. */
type TableFor =
  | typeof newsItems
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

/** Labels for an award's recipient, in the order the editor offers them. */
export const RECIPIENT_LABELS: Record<(typeof AWARD_RECIPIENTS)[number], string> = {
  personal: "Prof. Adeyanju",
  gbb: "Galaxy Backbone",
};

const story: Field = {
  name: "body",
  label: "Full story",
  type: "richtext",
  placement: "main",
  maxLength: 100_000,
  placeholder: "Tell the story — who presented it, where, and why it matters…",
};

const gallery: Field = {
  name: "galleryIds",
  label: "More photos",
  type: "gallery",
  placement: "main",
  help: "Shown as a gallery on the page. Visitors can click any photo to see it full size.",
};

export const CONTENT_TYPES: ContentType[] = [
  {
    slug: "news",
    label: "News & Awards",
    singular: "Update",
    description:
      "Everything you announce — an award, an invitation, the inaugural lecture, coverage in the press. Each one gets its own page on the News & Awards page, and the newest appear on the home page.",
    icon: "Newspaper",
    group: "News & Awards",
    table: newsItems,
    titleField: "title",
    revalidates: ["/news", "/"],
    article: { path: "/news" },
    fields: [
      {
        name: "category",
        label: "What kind of update is this?",
        type: "choice",
        required: true,
        placement: "main",
        appearance: "kind",
        options: NEWS_CATEGORY_ORDER.map((value) => ({
          value,
          label: NEWS_CATEGORY_INFO[value].label,
          help: NEWS_CATEGORY_INFO[value].help,
        })),
      },
      {
        name: "imageId",
        label: "Cover photo",
        type: "image",
        placement: "main",
        appearance: "cover",
        help: "The main photo — shown on the card and across the top of the page.",
      },
      {
        name: "title",
        label: "Headline",
        type: "text",
        required: true,
        maxLength: 400,
        placement: "main",
        appearance: "headline",
        watch: "category",
        placeholder: "What is the news?",
        placeholderWhen: {
          award: "Name of the award",
          invitation: "e.g. Invited to speak at the annual summit",
          lecture: "e.g. Inaugural Lecture of Prof. Ibrahim Adeyanju",
          press: "Headline of the article",
          announcement: "What is the news?",
        },
      },
      {
        name: "summary",
        label: "Summary",
        type: "textarea",
        maxLength: 1000,
        placement: "main",
        appearance: "lead",
        placeholder: "One or two sentences that sum it up.",
        help: "Shown on the card and at the top of the page.",
      },
      {
        ...story,
        watch: "category",
        placeholder: "Tell the story — what happened, who was involved, and why it matters…",
      },
      gallery,
      {
        name: "recipient",
        label: "Awarded to",
        type: "choice",
        required: true,
        placement: "side",
        showWhen: { field: "category", values: ["award"] },
        options: AWARD_RECIPIENTS.map((value) => ({
          value,
          label: RECIPIENT_LABELS[value],
        })),
      },
      {
        name: "happenedOn",
        label: "Date",
        type: "date",
        placement: "side",
        watch: "category",
        labelWhen: {
          award: "Date presented",
          invitation: "Date of the event",
          lecture: "Date of the lecture",
          press: "Date published",
          announcement: "Date",
        },
      },
      {
        name: "source",
        label: "Source",
        type: "text",
        maxLength: 200,
        placement: "side",
        watch: "category",
        labelWhen: {
          award: "Presented by",
          invitation: "Hosted by",
          lecture: "Hosted by",
          press: "Publication",
          announcement: "Source",
        },
        placeholderWhen: {
          award: "Who gave the award",
          invitation: "Who is hosting the event",
          lecture: "Who is hosting the lecture",
          press: "BusinessDay",
          announcement: "",
        },
        help: "Optional.",
      },
      {
        name: "href",
        label: "Link",
        type: "url",
        placement: "side",
        watch: "category",
        labelWhen: {
          award: "Link (optional)",
          invitation: "Link to the event page",
          lecture: "Link to the registration or event page",
          press: "Link to the original article",
          announcement: "Link (optional)",
        },
        placeholder: "https://…",
      },
      {
        name: "attachmentId",
        label: "PDF",
        type: "attachment",
        placement: "side",
        help: "A certificate, programme, press release or scanned clipping visitors can download.",
      },
      {
        name: "featured",
        label: "Show in “Latest” on the home page",
        type: "toggle",
        placement: "side",
        help: "It appears just under the top of the home page, with a “New” tag for two weeks.",
      },
    ],
  },
  {
    slug: "initiatives",
    label: "Initiatives",
    singular: "Initiative",
    description:
      "Flagship programmes such as 1Government Cloud and Project 774. Each one has its own page, linked from the Impact page.",
    icon: "Rocket",
    group: "Impact page",
    table: initiatives,
    titleField: "title",
    revalidates: ["/impact", "/"],
    article: { path: "/impact/initiatives" },
    fields: [
      {
        name: "imageId",
        label: "Cover photo",
        type: "image",
        placement: "main",
        appearance: "cover",
        help: "Shown on the card and across the top of the page.",
      },
      {
        name: "title",
        label: "Initiative name",
        type: "text",
        required: true,
        maxLength: 200,
        placement: "main",
        appearance: "headline",
        placeholder: "Name of the initiative",
      },
      {
        name: "detail",
        label: "Summary",
        type: "textarea",
        required: true,
        maxLength: 1000,
        placement: "main",
        appearance: "lead",
        placeholder: "What it is and what it has delivered, in a sentence or two.",
        help: "Shown on the card and at the top of the page.",
      },
      story,
      gallery,
      {
        name: "icon",
        label: "Icon",
        type: "icon",
        required: true,
        placement: "side",
        help: "Shown on the initiative's card when it has no cover photo.",
      },
      {
        name: "attachmentId",
        label: "PDF",
        type: "attachment",
        placement: "side",
        help: "A brochure, report or factsheet visitors can download.",
      },
    ],
  },
  {
    slug: "impact-stats",
    label: "Impact numbers",
    singular: "Number",
    description:
      "The four counters across the top of the Impact page. Separate from the home page's headline numbers.",
    icon: "Gauge",
    group: "Impact page",
    table: impactStats,
    titleField: "label",
    revalidates: ["/impact"],
    fields: [
      {
        name: "value",
        label: "Number",
        type: "number",
        required: true,
        help: "Digits only.",
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
    icon: "Route",
    group: "About & profile",
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
    icon: "Microscope",
    group: "About & profile",
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
    icon: "GraduationCap",
    group: "About & profile",
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
      "Fellowships, scholarships and personal recognition. Shown on the About page.",
    icon: "Medal",
    group: "About & profile",
    table: honours,
    titleField: "text",
    revalidates: ["/about"],
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
    label: "Home page numbers",
    singular: "Number",
    description: "The large figures in the dark band on the home page only.",
    icon: "Hash",
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
        help: "Digits only.",
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
    icon: "ListChecks",
    group: "About & profile",
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
    label: "Photos on pages",
    singular: "Photo",
    description:
      "The photographs built into the pages, such as the main portrait on the home page. Choose which photo goes in each place — you cannot add or remove places.",
    icon: "Images",
    group: "Photos",
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
    label: "Keywords",
    singular: "Keyword",
    description: "The list of keywords under the top of the home page.",
    icon: "MoveHorizontal",
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
        /* Upper bound is the largest value a Postgres integer column holds.
           Without it, a longer number passes validation and then fails in the
           database as a 500 rather than as a message on the field. */
        rule = z.coerce
          .number({ error: `${field.label} must be a number.` })
          .int(`${field.label} must be a whole number.`)
          .min(0, `${field.label} cannot be negative.`)
          .max(
            2_147_483_647,
            `${field.label} is too large — the maximum is 2,147,483,647.`
          );
        break;
      }
      case "url": {
        const url = z
          .url({ error: `${field.label} must be a full URL starting with https://` })
          .max(2000);
        rule = field.required ? url : url.or(z.literal("")).nullable();
        break;
      }
      case "image":
      case "attachment": {
        /* An empty picker posts "", which means "none". */
        rule = z.uuid().or(z.literal("")).nullable();
        break;
      }
      case "gallery": {
        rule = z
          .array(z.uuid())
          .max(40, `${field.label} can hold up to 40 photos.`);
        break;
      }
      case "date": {
        rule = z
          .iso.date({ error: `${field.label} must be a valid date.` })
          .or(z.literal(""))
          .nullable();
        break;
      }
      case "choice": {
        const values = (field.options ?? []).map((option) => option.value);
        const choice = z.enum(values as [string, ...string[]], {
          error: `Choose one of the options for ${field.label}.`,
        });
        /* A choice that is only shown for some answers is empty for the rest. */
        rule = field.showWhen ? choice.or(z.literal("")).nullable() : choice;
        break;
      }
      case "toggle": {
        rule = z.coerce.boolean();
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
