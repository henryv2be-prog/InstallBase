import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";
import { getPublicMapLocation } from "@/lib/kasifind/location-display";
import {
  filterReachableUploadUrls,
  resolvePublicUploadUrl,
} from "@/lib/kasifind/upload-asset";

export type PublicListingView = {
  id: string;
  displayName: string;
  description: string;
  phone: string;
  whatsapp: string | null;
  locationLabel: string;
  hideExactLocation: boolean;
  map: ReturnType<typeof getPublicMapLocation>;
  priceHint: string | null;
  hoursNote: string | null;
  profileImageUrl: string | null;
  categories: { slug: string; name: string }[];
  services: { name: string }[];
  photos: string[];
  reviews: {
    id: string;
    rating: number;
    body: string;
    authorName: string | null;
    verified: boolean;
    createdAt: string;
  }[];
  averageRating: number | null;
  reviewCount: number;
};

type ListingWithRelations = NonNullable<
  Awaited<ReturnType<typeof fetchListingRow>>
>;

async function fetchListingRow(
  kf: ReturnType<typeof getKasiFindPrisma>,
  where: Parameters<typeof kf.kfProviderListing.findFirst>[0]["where"]
) {
  return kf.kfProviderListing.findFirst({
    where,
    include: {
      categories: { include: { category: true } },
      services: true,
      photos: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { hidden: false },
        orderBy: { createdAt: "desc" },
        take: 30,
      },
    },
  });
}

async function toPublicListingView(listing: ListingWithRelations): Promise<PublicListingView> {
  const ratings = listing.reviews.map((r) => r.rating);
  const reviewCount = ratings.length;
  const averageRating =
    reviewCount > 0 ? ratings.reduce((a, b) => a + b, 0) / reviewCount : null;

  const map = getPublicMapLocation(
    listing.latitude,
    listing.longitude,
    listing.hideExactLocation
  );

  return {
    id: listing.id,
    displayName: listing.displayName,
    description: listing.description,
    phone: listing.phone,
    whatsapp: listing.whatsapp,
    locationLabel: listing.locationLabel,
    hideExactLocation: listing.hideExactLocation,
    map,
    priceHint: listing.priceHint,
    hoursNote: listing.hoursNote,
    profileImageUrl: await resolvePublicUploadUrl(listing.profileImageUrl),
    categories: listing.categories.map((c) => ({
      slug: c.category.slug,
      name: c.category.name,
    })),
    services: listing.services.map((s) => ({ name: s.name })),
    photos: await filterReachableUploadUrls(listing.photos.map((p) => p.url)),
    reviews: listing.reviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      body: r.body,
      authorName: r.authorName,
      verified: r.verified,
      createdAt: r.createdAt.toISOString(),
    })),
    averageRating,
    reviewCount,
  };
}

export async function getPublicListing(id: string): Promise<PublicListingView | null> {
  const kf = getKasiFindPrisma();
  const listing = await fetchListingRow(kf, {
    id,
    status: "PUBLISHED",
    moderationStatus: "APPROVED",
  });
  if (!listing) return null;
  return toPublicListingView(listing);
}

/** Lets the signed-in owner preview draft or pending listings at the public URL. */
export async function getOwnerPreviewListing(
  id: string,
  ownerUserId: string
): Promise<PublicListingView | null> {
  const kf = getKasiFindPrisma();
  const listing = await fetchListingRow(kf, {
    id,
    userId: ownerUserId,
    status: { in: ["DRAFT", "PUBLISHED"] },
  });
  if (!listing) return null;
  return toPublicListingView(listing);
}

export async function resolveProviderListingPage(
  id: string,
  viewerUserId: string | null
): Promise<{ listing: PublicListingView; ownerPreview: boolean } | null> {
  const publicListing = await getPublicListing(id);
  if (publicListing) return { listing: publicListing, ownerPreview: false };

  if (!viewerUserId) return null;

  const ownerListing = await getOwnerPreviewListing(id, viewerUserId);
  if (!ownerListing) return null;

  return { listing: ownerListing, ownerPreview: true };
}
