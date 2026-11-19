import "server-only";
import type { MetadataRoute } from "next";
import { getKasiFindPrisma, isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { listKfCategorySlugsForSitemap } from "@/lib/kasifind/categories";
import { buildSitemapEntries } from "@/lib/kasifind/seo-sitemap-core";
import { getConfiguredSiteOrigin } from "@/lib/kasifind/site-config";

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
  const origin = getConfiguredSiteOrigin();
  if (!origin) return [];

  const [listings, categories] = await Promise.all([
    fetchSitemapListingRows(),
    isKasiFindDbConfigured() ? listKfCategorySlugsForSitemap() : [],
  ]);
  return buildSitemapEntries(origin, listings, categories);
}