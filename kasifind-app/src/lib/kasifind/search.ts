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

export async function searchProviders(input: {
  query: string;
  center: GeoPoint;
  radiusKm?: number;
  categorySlug?: string | null;
  limit?: number;
}): Promise<{ results: ProviderSearchHit[]; radiusKm: number; expanded: boolean }> {
  const kf = getKasiFindPrisma();
  const radiusKm = parseRadiusKm(input.radiusKm);
  const limit = Math.min(input.limit ?? 40, 60);
  const tokens = tokenizeQuery(input.query);
  const box = boundingBox(input.center, radiusKm);

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

  const scoredRaw = listings
    .map((listing) => {
      const distanceKm = haversineDistanceKm(input.center, {
        latitude: listing.latitude,
        longitude: listing.longitude,
      });
      if (distanceKm > radiusKm) return null;

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
    .filter((row): row is NonNullable<typeof row> => row !== null)
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.score !== b.score) return b.score - a.score;
      return a.distanceKm - b.distanceKm;
    })
    .slice(0, limit);

  const scored = await Promise.all(
    scoredRaw.map(async ({ score: _score, featured: _featured, ...rest }) => ({
      ...rest,
      photoUrls: await filterReachableUploadUrls(rest.photoUrls),
      profileImageUrl: await resolvePublicUploadUrl(rest.profileImageUrl),
    }))
  );

  return { results: scored, radiusKm, expanded: false };
}

export async function searchWithAutoExpand(input: {
  query: string;
  center: GeoPoint;
  radiusKm?: number;
  categorySlug?: string | null;
}): Promise<{ results: ProviderSearchHit[]; radiusKm: number; expanded: boolean }> {
  const startRadius = parseRadiusKm(input.radiusKm);
  const radii = [startRadius, 10, 25, 50].filter((v, i, arr) => arr.indexOf(v) === i);

  for (let i = 0; i < radii.length; i++) {
    const radiusKm = radii[i]!;
    const batch = await searchProviders({ ...input, radiusKm, categorySlug: input.categorySlug });
    if (batch.results.length > 0 || i === radii.length - 1) {
      return { ...batch, expanded: radiusKm > startRadius };
    }
  }

  return { results: [], radiusKm: startRadius, expanded: false };
}
