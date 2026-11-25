import type { KfSearchResult } from "@/components/kasifind/types";
import { listingPublicPath } from "@/lib/kasifind/share-provider-listing";

type Props = {
  results: Pick<KfSearchResult, "id" | "displayName" | "locationLabel">[];
};

/**
 * Server-rendered provider directory (always in HTML).
 * Complements the interactive client grid for crawlers and no-JS visitors.
 */
export function KfHomeBrowseSeoIndex({ results }: Props) {
  if (results.length === 0) return null;

  return (
    <details className="kf-home-seo-index kf-animate-in mt-6">
      <summary className="cursor-pointer text-sm font-medium text-[var(--kf-forest)]">
        Browse all {results.length} published providers
      </summary>
      <nav aria-label="Published local providers" className="mt-3">
        <ul className="grid gap-2 sm:grid-cols-2">
          {results.map((listing) => (
            <li key={listing.id}>
              <a href={listingPublicPath(listing.id)} className="kf-link text-sm">
                {listing.displayName}
                {listing.locationLabel ? (
                  <span className="text-[var(--kf-muted)]"> · {listing.locationLabel}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </details>
  );
}