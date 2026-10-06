import { NEWS_CATEGORIES, type NewsCategory } from "@/db/schema";

/**
 * How each kind of news item is named: on its badge and in the CMS form
 * (`label`), on the filter buttons of the News & Awards page (`filter`), and
 * in the one-line explanation shown when the team chooses what to post.
 */
export const NEWS_CATEGORY_INFO: Record<
  NewsCategory,
  { label: string; filter: string; help: string }
> = {
  award: {
    label: "Award",
    filter: "Awards",
    help: "An award given to Prof. Adeyanju or to Galaxy Backbone.",
  },
  invitation: {
    label: "Invitation",
    filter: "Invitations",
    help: "Invited, selected or appointed to speak or take part in an event.",
  },
  lecture: {
    label: "Inaugural Lecture",
    filter: "Inaugural Lecture",
    help: "The inaugural lecture: the announcement and news about it.",
  },
  press: {
    label: "In the press",
    filter: "In the press",
    help: "An article or interview about him.",
  },
  announcement: {
    label: "Other news",
    filter: "Other news",
    help: "Anything else worth announcing.",
  },
};

/** The categories in the order the form and the filters list them. */
export const NEWS_CATEGORY_ORDER = NEWS_CATEGORIES;
