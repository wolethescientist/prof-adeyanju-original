/**
 * The fixed image slots in the page designs.
 *
 * Each slot names one place in the layout the team can swap the picture for.
 * The `fallback` is the file the site originally shipped with: if a slot has
 * no image chosen — or someone deletes the image it pointed at — the page
 * quietly renders the original rather than breaking. The dimensions are the
 * ones the design was built around, used to reserve space before the image
 * loads.
 */
export type Slot = {
  slot: string;
  label: string;
  /** Shown in the CMS so the team knows which picture they are changing. */
  hint: string;
  fallback: {
    src: string;
    alt: string;
    width: number;
    height: number;
  };
};

export const SLOTS: Slot[] = [
  {
    slot: "hero-portrait",
    label: "Home page — main portrait",
    hint: "The large portrait beside the headline at the top of the home page.",
    fallback: {
      src: "/images/adeyanju-portrait.jpg",
      alt: "Official portrait of Prof. Ibrahim Adepoju Adeyanju at the Galaxy Backbone headquarters, Abuja",
      width: 1600,
      height: 2000,
    },
  },
  {
    slot: "profile-portrait",
    label: "Home page — profile photo",
    hint: "The smaller framed photo in the “A scholar at the helm” section.",
    fallback: {
      src: "/images/portrait-mit.png",
      alt: "Prof. Ibrahim Adeyanju as an MIT Empowering the Teachers fellow",
      width: 300,
      height: 448,
    },
  },
  {
    slot: "team-photo",
    label: "Team photograph",
    hint: "Used on both the home page and the Impact page.",
    fallback: {
      src: "/images/team-gbb.jpeg",
      alt: "Prof. Ibrahim Adeyanju with Galaxy Backbone's executive management team",
      width: 960,
      height: 641,
    },
  },
  {
    slot: "research-portrait",
    label: "Research page photo",
    hint: "The framed photo beside the citations figure on the Research page.",
    fallback: {
      src: "/images/portrait-2.jpg",
      alt: "Dr. Ibrahim Adeyanju at his PhD graduation, Robert Gordon University",
      width: 700,
      height: 400,
    },
  },
];

/** What a page receives for a slot, whether it came from the CMS or the fallback. */
export type ResolvedImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption: string | null;
};
