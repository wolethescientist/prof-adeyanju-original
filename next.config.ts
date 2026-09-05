import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
