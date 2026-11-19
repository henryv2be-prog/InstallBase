import { truncateForMeta } from "@/lib/kasifind/listing-og";
import type { PublicListingView } from "@/lib/kasifind/listing-public";
import { publicAssetUrl } from "@/lib/kasifind/public-asset-url";

export type ListingJsonLdInput = {
  listing: PublicListingView;
  canonicalUrl: string;
  siteOrigin: string;
};

function listingSchemaType(categorySlug: string | undefined): string {
  const slug = categorySlug?.toLowerCase() ?? "";
  if (slug.includes("automotive") || slug.includes("car")) return "AutomotiveBusiness";
  if (slug.includes("plumb")) return "Plumber";
  if (slug.includes("electrical") || slug.includes("electric")) return "Electrician";
  if (slug.includes("hair") || slug.includes("beauty")) return "HairSalon";
  if (slug.includes("restaurant") || slug.includes("food")) return "FoodEstablishment";
  return "LocalBusiness";
}

/** Schema.org JSON-LD from fields already shown on the public listing page. */
export function buildListingJsonLd(input: ListingJsonLdInput): Record<string, unknown> {
  const { listing, canonicalUrl, siteOrigin } = input;
  const primaryCategory = listing.categories[0]?.slug;
  const type = listingSchemaType(primaryCategory);

  const imageUrls = [listing.profileImageUrl, ...listing.photos]
    .filter((url): url is string => Boolean(url?.trim()))
    .map((url) => publicAssetUrl(url, siteOrigin))
    .filter((url) => url.startsWith("http"));

  const description = truncateForMeta(listing.description, 500);

  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": type,
    name: listing.displayName,
    description,
    url: canonicalUrl,
    telephone: listing.phone,
    image: imageUrls.length > 0 ? imageUrls : undefined,
  };

  if (listing.locationLabel.trim()) {
    jsonLd.areaServed = {
      "@type": "Place",
      name: listing.locationLabel.trim(),
    };
  }

  if (!listing.hideExactLocation && !listing.map.approximate) {
    jsonLd.geo = {
      "@type": "GeoCoordinates",
      latitude: listing.map.latitude,
      longitude: listing.map.longitude,
    };
  }

  if (listing.reviewCount > 0 && listing.averageRating !== null) {
    jsonLd.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(listing.averageRating.toFixed(1)),
      reviewCount: listing.reviewCount,
      bestRating: 5,
      worstRating: 1,
    };
  }

  for (const key of Object.keys(jsonLd)) {
    if (jsonLd[key] === undefined) delete jsonLd[key];
  }

  return jsonLd;
}