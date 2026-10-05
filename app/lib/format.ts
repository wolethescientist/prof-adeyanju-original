/** "2025-03-14" → "14 March 2025". Dates are stored without a time zone. */
export function formatDate(value: string | null | undefined) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(Date.UTC(year, month - 1, day)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export { formatBytes } from "@/lib/cms/media-types";

/** "20+", "1,200" — a figure with its suffix, for the numbers on the site. */
export function formatCount(value: number, suffix = "") {
  return `${value.toLocaleString("en-US")}${suffix}`;
}

/** Who an award was given to, as visitors read it. */
export const RECIPIENT_NAME = {
  personal: "Prof. Adeyanju",
  gbb: "Galaxy Backbone",
} as const;
