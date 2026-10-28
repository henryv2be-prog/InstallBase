import "server-only";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

export async function getPublicListing(id: string) {
  const kf = getKasiFindPrisma();
  const listing = await kf.kfProviderListing.findFirst({
    where: {
      id,
      status: "PUBLISHED",
      moderationStatus: "APPROVED",
    },
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
  if (!listing) return null;

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
    hideExactLocation: listing.hideExactLocation,
    priceHint: listing.priceHint,
    hoursNote: listing.hoursNote,
    profileImageUrl: listing.profileImageUrl,
    categories: listing.categories.map((c) => ({
      slug: c.category.slug,
      name: c.category.name,
    })),
    services: listing.services.map((s) => ({ name: s.name })),
    photos: listing.photos.map((p) => p.url),
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
