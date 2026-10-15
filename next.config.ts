import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export",
  basePath: "/Cafe-3D-Menu",
  assetPrefix: "/Cafe-3D-Menu/",
  images: {
    unoptimized: true,
  },
  // PPR not supported with output: export
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
