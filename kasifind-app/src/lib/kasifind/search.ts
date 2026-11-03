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
import {
  getPublicMapLocation,
  type PublicMapLocation,
} from "@/lib/kasifind/location-display";
import { buildPublishedListingWhere } from "@/lib/kasifind/search-query";
import { tokenizeSearchQuery } from "@/lib/kasifind/search-normalize";
import {
  compareSearchRanking,
  listingMatchesSearchTokens,
  scoreListingRelevance,
} from "@/lib/kasifind/search-relevance";

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
  map: PublicMapLocation;
};

type ListingRow = Awaited<ReturnType<typeof fetchListingCandidates>>[number];

type ScoredListingRow = ProviderSearchHit & {
  relevanceTotal: number;
  featured: boolean;
};

const LISTING_INCLUDE = {
  categories: { include: { category: true } },
  services: true,
  photos: { orderBy: { sortOrder: "asc" as const }, take: 6 },
  reviews: { where: { hidden: false }, select: { rating: true } },
};

async function fetchListingCandidates(input: {
  query: string;
  categorySlug?: string | null;
  geo?: ReturnType<typeof boundingBox>;
}) {
  const kf = getKasiFindPrisma();
  const where = buildPublishedListingWhere({
    query: input.query,
    categorySlug: input.categorySlug,
    geo: input.geo,
  });

  return kf.kfProviderListing.findMany({
    where,
    include: LISTING_INCLUDE,
  });
}

function mapListingToHit(
  listing: ListingRow,
  input: {
    center?: GeoPoint;
    maxRadiusKm?: number;
    tokens: string[];
  }
): ScoredListingRow | null {
  const distanceKm =
    input.center !== undefined
      ? haversineDistanceKm(input.center, {
          latitude: listing.latitude,
          longitude: listing.longitude,
        })
      : Number.NaN;

  if (
    input.center !== undefined &&
    input.maxRadiusKm !== undefined &&
    distanceKm > input.maxRadiusKm
  ) {
    return null;
  }

  const fields = {
    displayName: listing.displayName,
    description: listing.description,
    locationLabel: listing.locationLabel,
    services: listing.services.map((s) => ({ name: s.name, keywords: s.keywords })),
    categories: listing.categories.map((c) => ({ name: c.category.name })),
  };

  if (!listingMatchesSearchTokens(fields, input.tokens)) {
    return null;
  }

  const relevance = scoreListingRelevance(fields, input.tokens);
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
    map: getPublicMapLocation(
      listing.latitude,
      listing.longitude,
      listing.hideExactLocation
    ),
    relevanceTotal: relevance.total,
    featured: listing.featured,
  };
}

function sortSearchHits(
  rows: ScoredListingRow[],
  options: { hasQuery: boolean; useDistance: boolean }
): ScoredListingRow[] {
  return [...rows].sort((a, b) => compareSearchRanking(a, b, options));
}

async function finalizeSearchHits(
  scoredRaw: ScoredListingRow[],
  limit: number
): Promise<ProviderSearchHit[]> {
  const sliced = scoredRaw.slice(0, limit);
  return Promise.all(
    sliced.map(async ({ relevanceTotal: _r, featured: _f, ...rest }) => ({
      ...rest,
      photoUrls: await filterReachableUploadUrls(rest.photoUrls),
      profileImageUrl: await resolvePublicUploadUrl(rest.profileImageUrl),
    }))
  );
}

async function fetchScoredGeoListings(input: {
  query: string;
  center: GeoPoint;
  maxRadiusKm: number;
  categorySlug?: string | null;
}): Promise<ScoredListingRow[]> {
  const tokens = tokenizeSearchQuery(input.query);
  const box = boundingBox(input.center, input.maxRadiusKm);
  const listings = await fetchListingCandidates({
    query: input.query,
    categorySlug: input.categorySlug,
    geo: box,
  });

  return listings
    .map((listing) =>
      mapListingToHit(listing, {
        center: input.center,
        maxRadiusKm: input.maxRadiusKm,
        tokens,
      })
    )
    .filter((row): row is ScoredListingRow => row !== null);
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
  const hasQuery = tokenizeSearchQuery(input.query).length > 0;

  const scoredRaw = await fetchScoredGeoListings({
    query: input.query,
    center: input.center,
    maxRadiusKm: radiusKm,
    categorySlug: input.categorySlug,
  });

  const sorted = sortSearchHits(
    scoredRaw.filter((row) => row.distanceKm <= radiusKm),
    { hasQuery, useDistance: true }
  );

  const results = await finalizeSearchHits(sorted, limit);
  return { results, radiusKm, expanded: false };
}

/** No distance filter — for visitors who skip or deny location. */
export async function searchProvidersBrowse(input: {
  query: string;
  categorySlug?: string | null;
  limit?: number;
}): Promise<{ results: ProviderSearchHit[]; radiusKm: 0; expanded: false; browse: true }> {
  const limit = Math.min(input.limit ?? 40, 60);
  const tokens = tokenizeSearchQuery(input.query);
  const hasQuery = tokens.length > 0;

  const listings = await fetchListingCandidates({
    query: input.query,
    categorySlug: input.categorySlug,
  });

  const scoredRaw = listings
    .map((listing) => mapListingToHit(listing, { tokens }))
    .filter((row): row is ScoredListingRow => row !== null);

  const sorted = sortSearchHits(scoredRaw, { hasQuery, useDistance: false });
  const results = await finalizeSearchHits(sorted, limit);

  return { results, radiusKm: 0, expanded: false, browse: true };
}

export type ProgressiveSearchResult = {
  results: ProviderSearchHit[];
  radiusKm: number;
  expanded: boolean;
  includesSurroundingAreas: boolean;
  localListingCount: number;
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
  const hasQuery = tokenizeSearchQuery(input.query).length > 0;

  const scoredRaw = await fetchScoredGeoListings({
    query: input.query,
    center: input.center,
    maxRadiusKm: DISCOVERY_MAX_RADIUS_KM,
    categorySlug: input.categorySlug,
  });

  const plan = planProgressiveDiscovery(scoredRaw.map((h) => h.distanceKm));
  const withinOuter = filterHitsWithinRadius(scoredRaw, plan.outerRadiusKm);
  const sorted = sortSearchHits(withinOuter, { hasQuery, useDistance: true });
  const results = await finalizeSearchHits(sorted, limit);

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
