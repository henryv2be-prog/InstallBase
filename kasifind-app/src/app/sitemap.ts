import type { MetadataRoute } from "next";
import { buildKasiFindSitemap } from "@/lib/kasifind/seo-sitemap";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  return buildKasiFindSitemap();
}