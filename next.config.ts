import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      /* Image uploads go through a Server Action, which refuses bodies over
         1MB by default. 4.5MB is the most Vercel accepts for any function
         request; the upload form shrinks larger photos below it before
         sending (see MAX_REQUEST_BYTES in lib/cms/constants.ts). */
      bodySizeLimit: "4.5mb",
    },
  },
  /* News & Awards replaced the separate Recognition page, and awards and press
     coverage became news items (migration 0003 kept their addresses), so links
     people have already shared keep working. */
  async redirects() {
    return [
      { source: "/recognition", destination: "/news", permanent: true },
      { source: "/recognition/awards/:slug", destination: "/news/:slug", permanent: true },
      { source: "/recognition/press/:slug", destination: "/news/:slug", permanent: true },
    ];
  },
  images: {
    /* Once localPatterns is set, only these local paths may be optimised.
       `search: ""` forbids query strings entirely — the cache-busting checksum
       lives in the path instead, so nobody can flood the optimizer's cache by
       inventing query strings. */
    localPatterns: [
      { pathname: "/images/**", search: "" },
      { pathname: "/api/media/**", search: "" },
    ],
  },
};

export default nextConfig;
