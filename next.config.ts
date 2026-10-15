import type { NextConfig } from "next";
import { BASE_PATH, IS_PRODUCTION } from "./src/lib/basePath";

const nextConfig: NextConfig = {
  /* config options here */
  // Static export for GitHub Pages.
  output: "export",
  // Only the production export lives under the repository sub-path; the dev
  // server stays at the origin root so http://localhost:3000 works.
  basePath: IS_PRODUCTION ? BASE_PATH : undefined,
  images: {
    unoptimized: true,
  },
  // PPR (cacheComponents) is incompatible with output: "export"
  // ("Invariant: PPR cannot be enabled in export mode"), so both are off.
  // cacheComponents: true,
  // partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
