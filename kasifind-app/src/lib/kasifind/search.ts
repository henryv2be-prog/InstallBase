import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import {
  boundingBox,
  haversineDistanceKm,
  type GeoPoint,
  parseRadiusKm,
} from "@/lib/kasifind/geo";
import {
  filterReachableUploadUrls,
  resolvePublicUploadUrl,
} from "@/lib/kasifind/upload-asset";
import { DISCOVERY_MAX_RADIUS_KM } from "@/lib/kasifind/discovery-config";
import {
  filterHitsWithinRadius,
  planProgressiveDiscovery,
} from "@/lib/kasifind/progressive-discovery";

export type ProviderSearchHit = {
  id: string;
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  profileImageUrl: string | null;
  priceHint: string | null;
  distanceKm: number;
  categories: { slug: string; name: string }[];
  services: { name: string }[];
  photoUrls: string[];
  averageRating: number | null;
  reviewCount: number;
};

function tokenizeQuery(query: string): string[] {
  return query
    .toLowerCase()
    .split(/[\s,/+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 2);
}

type ScoredListingRow = ProviderSearchHit & { score: number; featured: boolean };

async function fetchScoredGeoListings(input: {
  query: string;
  center: GeoPoint;
  maxRadiusKm: number;
  categorySlug?: string | null;
}): Promise<ScoredListingRow[]> {
  const kf = getKasiFindPrisma();
  const tokens = tokenizeQuery(input.query);
  const box = boundingBox(input.center, input.maxRadiusKm);

  const listings = await kf.kfProviderListing.findMany({
    where: {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      latitude: { gte: box.minLat, lte: box.maxLat },
      longitude: { gte: box.minLng, lte: box.maxLng },
      ...(input.categorySlug
        ? {
            categories: {
              some: { category: { slug: input.categorySlug } },
            },
          }
        : {}),
    },
    include: {
      categories: { include: { category: true } },
      services: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 6 },
      reviews: { where: { hidden: false }, select: { rating: true } },
    },
    take: 200,
  });

  return listings
    .map((listing) => {
      const distanceKm = haversineDistanceKm(input.center, {
        latitude: listing.latitude,
        longitude: listing.longitude,
      });
      if (distanceKm > input.maxRadiusKm) return null;

      const haystack = [
        listing.displayName,
        listing.description,
        listing.locationLabel,
        ...listing.services.map((s) => `${s.name} ${s.keywords}`),
        ...listing.categories.map((c) => c.category.name),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (tokens.length === 0) score = 1;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 2;
      }
      if (score === 0 && tokens.length > 0) return null;

      const ratings = listing.reviews.map((r) => r.rating);
      const reviewCount = ratings.length;
      const averageRating =
        reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : null;

      return {
        id: listing.id,
        displayName: listing.displayName,
        description: listing.description,
        phone: listing.phone,
        whatsapp: listing.whatsapp,
        locationLabel: listing.locationLabel,
        profileImageUrl: listing.profileImageUrl,
        priceHint: listing.priceHint,
        distanceKm,
        categories: listing.categories.map((c) => ({
          slug: c.category.slug,
          name: c.category.name,
        })),
        services: listing.services.map((s) => ({ name: s.name })),
        photoUrls: listing.photos.map((p) => p.url),
        averageRating,
        reviewCount,
        score,
        featured: listing.featured,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);
}

async function finalizeSearchHits(
  scoredRaw: ScoredListingRow[],
  limit: number
): Promise<ProviderSearchHit[]> {
  const sliced = scoredRaw.slice(0, limit);
  return Promise.all(
    sliced.map(async ({ score: _score, featured: _featured, ...rest }) => ({
      ...rest,
      photoUrls: await filterReachableUploadUrls(rest.photoUrls),
      profileImageUrl: await resolvePublicUploadUrl(rest.profileImageUrl),
    }))
  );
}

export async function searchProviders(input: {
  query: string;
  center: GeoPoint;
  radiusKm?: number;
  categorySlug?: string | null;
  limit?: number;
}): Promise<{ results: ProviderSearchHit[]; radiusKm: number; expanded: boolean }> {
  const radiusKm = parseRadiusKm(input.radiusKm);
  const limit = Math.min(input.limit ?? 40, 60);

  const scoredRaw = await fetchScoredGeoListings({
    query: input.query,
    center: input.center,
    maxRadiusKm: radiusKm,
    categorySlug: input.categorySlug,
  });

  const sorted = scoredRaw
    .filter((row) => row.distanceKm <= radiusKm)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      return a.distanceKm - b.distanceKm;
    });

  const scored = await finalizeSearchHits(sorted, limit);

  return { results: scored, radiusKm, expanded: false };
}

/** No distance filter — for visitors who skip or deny location. */
export async function searchProvidersBrowse(input: {
  query: string;
  categorySlug?: string | null;
  limit?: number;
}): Promise<{ results: ProviderSearchHit[]; radiusKm: 0; expanded: false; browse: true }> {
  const kf = getKasiFindPrisma();
  const limit = Math.min(input.limit ?? 40, 60);
  const tokens = tokenizeQuery(input.query);

  const listings = await kf.kfProviderListing.findMany({
    where: {
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
      ...(input.categorySlug
        ? {
            categories: {
              some: { category: { slug: input.categorySlug } },
            },
          }
        : {}),
    },
    include: {
      categories: { include: { category: true } },
      services: true,
      photos: { orderBy: { sortOrder: "asc" }, take: 6 },
      reviews: { where: { hidden: false }, select: { rating: true } },
    },
    take: 200,
  });

  const scoredRaw = listings
    .map((listing) => {
      const haystack = [
        listing.displayName,
        listing.description,
        listing.locationLabel,
        ...listing.services.map((s) => `${s.name} ${s.keywords}`),
        ...listing.categories.map((c) => c.category.name),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      if (tokens.length === 0) score = 1;
      for (const token of tokens) {
        if (haystack.includes(token)) score += 2;
      }
      if (score === 0 && tokens.length > 0) return null;

      const ratings = listing.reviews.map((r) => r.rating);
      const reviewCount = ratings.length;
      const averageRating =
        reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : null;

      return {
        id: listing.id,
        displayName: listing.displayName,
        description: listing.description,
        phone: listing.phone,
        whatsapp: listing.whatsapp,
        locationLabel: listing.locationLabel,
        profileImageUrl: listing.profileImageUrl,
        priceHint: listing.priceHint,
        distanceKm: Number.NaN,
        categories: listing.categories.map((c) => ({
          slug: c.category.slug,
          name: c.category.name,
        })),
        services: listing.services.map((s) => ({ name: s.name })),
        photoUrls: listing.photos.map((p) => p.url),
        averageRating,
        reviewCount,
        score,
        featured: listing.featured,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      if (a.reviewCount !== b.reviewCount) return b.reviewCount - a.reviewCount;
      return a.displayName.localeCompare(b.displayName);
    })
    .slice(0, limit);

  const scored = await Promise.all(
    scoredRaw.map(async ({ score: _score, featured: _featured, ...rest }) => ({
      ...rest,
      photoUrls: await filterReachableUploadUrls(rest.photoUrls),
      profileImageUrl: await resolvePublicUploadUrl(rest.profileImageUrl),
    }))
  );

  return { results: scored, radiusKm: 0, expanded: false, browse: true };
}

export type ProgressiveSearchResult = {
  results: ProviderSearchHit[];
  radiusKm: number;
  expanded: boolean;
  includesSurroundingAreas: boolean;
  localListingCount: number;
  /** True when no listings were found within the maximum discovery ring. */
  coverageExhausted: boolean;
};

/** Single-query progressive radius fallback (5 → 15 → 30 → 50 km). */
export async function searchWithProgressiveFallback(input: {
  query: string;
  center: GeoPoint;
  categorySlug?: string | null;
  limit?: number;
}): Promise<ProgressiveSearchResult> {
  const limit = Math.min(input.limit ?? 40, 60);
  const scoredRaw = await fetchScoredGeoListings({
    query: input.query,
    center: input.center,
    maxRadiusKm: DISCOVERY_MAX_RADIUS_KM,
    categorySlug: input.categorySlug,
  });

  const byDistance = [...scoredRaw].sort((a, b) => {
    if (a.distanceKm !== b.distanceKm) return a.distanceKm - b.distanceKm;
    return b.score - a.score;
  });

  const plan = planProgressiveDiscovery(byDistance.map((h) => h.distanceKm));
  const withinOuter = filterHitsWithinRadius(byDistance, plan.outerRadiusKm);
  const results = await finalizeSearchHits(withinOuter, limit);

  return {
    results,
    radiusKm: plan.outerRadiusKm,
    expanded: plan.includesSurroundingAreas,
    includesSurroundingAreas: plan.includesSurroundingAreas,
    localListingCount: plan.localListingCount,
    coverageExhausted: results.length === 0,
  };
}

/** @deprecated Use searchWithProgressiveFallback — kept for imports during transition. */
export const searchWithAutoExpand = searchWithProgressiveFallback;
