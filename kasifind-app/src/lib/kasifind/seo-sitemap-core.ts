import type { MetadataRoute } from "next";
import { listingPublicUrl } from "@/lib/kasifind/share-provider-listing";
import { PUBLIC_SITEMAP_STATIC_PATHS } from "@/lib/kasifind/site-config";

export type SitemapListingRow = {
  id: string;
  updatedAt: Date;
  status: string;
  moderationStatus: string;
};

export type SitemapCategoryRow = {
  slug: string;
  createdAt: Date;
};

/** Pure eligibility check for sitemap + tests. */
export function isListingSitemapEligible(
  listing: Pick<SitemapListingRow, "status" | "moderationStatus">
): boolean {
  return listing.status === "PUBLISHED" && listing.moderationStatus === "APPROVED";
}

export function buildSitemapEntries(
  origin: string,
  listings: SitemapListingRow[],
  categories: SitemapCategoryRow[] = []
): MetadataRoute.Sitemap {
  const base = origin.replace(/\/$/, "");
  const staticEntries: MetadataRoute.Sitemap = PUBLIC_SITEMAP_STATIC_PATHS.map((path) => ({
    url: path === "/" ? `${base}/` : `${base}${path}`,
    changeFrequency: path === "/" ? "daily" : "monthly",
    priority: path === "/" ? 1 : 0.6,
  }));

  const listingEntries: MetadataRoute.Sitemap = listings
    .filter(isListingSitemapEligible)
    .map((listing) => ({
      url: listingPublicUrl(listing.id, base),
      lastModified: listing.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${base}/categories/${category.slug}`,
    lastModified: category.createdAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...categoryEntries, ...listingEntries];
}