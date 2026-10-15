/**
 * Deployment base path for the GitHub Pages static export.
 *
 * The production export is served from a repository sub-path
 * (https://<user>.github.io/<repo>/), so every internal link and `_next` asset
 * must be prefixed. During local development the dev server serves the app at
 * the origin root, so the prefix must be empty — otherwise `/` 404s and the app
 * is only reachable under the repo sub-path.
 *
 * Imported by next.config.ts (for `basePath`) and by code that fetches runtime
 * assets outside Next's own pipeline (three.js loaders), since basePath is NOT
 * automatically applied to raw absolute URLs.
 */

/** Repository sub-path used by the production export. No trailing slash. */
export const BASE_PATH = "/Cafe-3D-Menu";

/** True for the production build (`next build`), false for `next dev`. */
export const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Prefix for runtime asset URLs: the repo sub-path in production, else root. */
export const ASSET_BASE = IS_PRODUCTION ? BASE_PATH : "";

/**
 * Prefix a public/ asset path with the deployment base path, e.g.
 * assetPath("/models/Cup_NOIR.glb") -> "/Cafe-3D-Menu/models/Cup_NOIR.glb".
 */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${ASSET_BASE}${path}`;
}
