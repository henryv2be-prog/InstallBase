import "server-only";

import type { KfSearchResult } from "@/components/kasifind/types";
import { listingPublicUrl } from "@/lib/kasifind/share-provider-listing";

/** Schema.org ItemList for the homepage nationwide browse (crawler-friendly). */
export function buildHomeBrowseItemListJsonLd(
  siteOrigin: string,
  results: Pick<KfSearchResult, "id" | "displayName">[]
): Record<string, unknown> {
  const origin = siteOrigin.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Local providers on KasiFind",
    numberOfItems: results.length,
    itemListElement: results.map((listing, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: listing.displayName,
      url: listingPublicUrl(listing.id, origin),
    })),
  };
}