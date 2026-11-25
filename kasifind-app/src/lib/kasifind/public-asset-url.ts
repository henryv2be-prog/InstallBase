import {
  getConfiguredSiteOrigin,
  siteOriginFromHeaders,
} from "@/lib/kasifind/site-config";

export { siteOriginFromHeaders } from "@/lib/kasifind/site-config";

/** Turn `/uploads/...` paths into absolute URLs when a site origin is known. */
export function publicAssetUrl(path: string, siteOrigin?: string | null): string {
  if (!path.startsWith("/")) return path;
  const origin = siteOrigin?.replace(/\/$/, "") ?? getConfiguredSiteOrigin() ?? undefined;
  if (!origin) return path;
  return `${origin}${path}`;
}
