import Link from "next/link";
import { MapPin } from "lucide-react";
import type { ProviderSearchHit } from "@/lib/kasifind/search";
import { listingPublicPath } from "@/lib/kasifind/share-provider-listing";

type Props = {
  listings: ProviderSearchHit[];
  categoryName: string;
};

export function KfCategoryBrowseList({ listings, categoryName }: Props) {
  if (listings.length === 0) {
    return (
      <p className="kf-section-sub mt-4">
        No {categoryName.toLowerCase()} listings are published yet. Check back soon or{" "}
        <Link href="/" className="kf-link underline">
          search from home
        </Link>
        .
      </p>
    );
  }

  return (
    <ul className="mt-4 space-y-3" aria-label={`${categoryName} listings`}>
      {listings.map((listing) => (
        <li key={listing.id} className="kf-card kf-card-interactive px-4 py-3">
          <Link href={listingPublicPath(listing.id)} className="block group">
            <h2 className="font-semibold text-[var(--kf-charcoal)] group-hover:text-[var(--kf-forest)]">
              {listing.displayName}
            </h2>
            <p className="mt-1 text-sm text-[var(--kf-muted)] line-clamp-2">{listing.description}</p>
            <p className="mt-2 inline-flex items-center gap-1 text-xs text-[var(--kf-muted)]">
              <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
              {listing.locationLabel}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}