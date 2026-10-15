/**
 * Single source of truth for the GitHub Pages sub-path. Imported by
 * next.config.ts (for basePath/assetPrefix) and by code that fetches
 * runtime assets outside Next's own pipeline (three.js loaders), since
 * basePath is NOT automatically applied to raw absolute URLs.
 */
export const BASE_PATH = "/Cafe-3D-Menu";

/**
 * Prefix a public/ asset path with the deployment base path, e.g.
 * assetPath("/models/Cup_NOIR.glb") -> "/Cafe-3D-Menu/models/Cup_NOIR.glb".
 */
export function assetPath(path: string): string {
  if (!path.startsWith("/")) return path;
  return `${BASE_PATH}${path}`;
}
