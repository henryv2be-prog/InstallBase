import "server-only";
import type { MetadataRoute } from "next";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { listKfCategorySlugsForSitemap } from "@/lib/kasifind/categories";
import { SEO_LOCATION_HUBS } from "@/lib/kasifind/location-seo-hubs";
import { buildSitemapEntries } from "@/lib/kasifind/seo-sitemap-core";
import { resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";
import { headers } from "next/headers";

export type { SitemapListingRow } from "@/lib/kasifind/seo-sitemap-core";
export { buildSitemapEntries, isListingSitemapEligible } from "@/lib/kasifind/seo-sitemap-core";

async function fetchSitemapListingRows() {
  if (!isKasiFindDbConfigured()) return [];
  const kf = getKasiFindPrisma();
  return kf.kfProviderListing.findMany({
    select: {
      id: true,
      updatedAt: true,
      status: true,
      moderationStatus: true,
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function buildKasiFindSitemap(): Promise<MetadataRoute.Sitemap> {
  const headerStore = await headers();
  const origin = resolvePublicSiteOrigin(headerStore);
  if (!origin) return [];

  const [listings, categories] = await Promise.all([
    fetchSitemapListingRows(),
    isKasiFindDbConfigured() ? listKfCategorySlugsForSitemap() : [],
  ]);
  const locationHubs = SEO_LOCATION_HUBS.map((hub) => ({ slug: hub.slug }));
  return buildSitemapEntries(origin, listings, categories, locationHubs);
}