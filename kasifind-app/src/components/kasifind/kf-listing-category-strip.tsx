"use client";

import Link from "next/link";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import {
  readDiscoveryState,
  readPersistedDiscoveryLocation,
  writeDiscoveryState,
} from "@/lib/kasifind/discovery-state";
import { markListingEntry } from "@/lib/kasifind/listing-page-attribution";
import { trackKfEvent } from "@/lib/kasifind/track-client";

export type ListingCategoryPick = {
  id: string;
  slug: string;
  name: string;
};

type Props = {
  categories: ListingCategoryPick[];
  listingId: string;
};

const MAX_CHIPS = 8;

export function KfListingCategoryStrip({ categories, listingId }: Props) {
  const chips = categories.slice(0, MAX_CHIPS);
  if (chips.length === 0) return null;

  return (
    <section className="mt-6 kf-animate-in" aria-labelledby="kf-listing-categories-title">
      <h2 id="kf-listing-categories-title" className="text-sm font-bold text-[var(--kf-charcoal)]">
        Browse by category
      </h2>
      <div className="kf-listing-category-scroll mt-2" role="list">
        {chips.map((c) => {
          const Icon = categoryIconForSlug(c.slug);
          return (
            <Link
              key={c.id}
              href="/"
              role="listitem"
              className="kf-listing-category-chip"
              onClick={() => {
                const saved = readDiscoveryState();
                const location =
                  saved?.location ??
                  readPersistedDiscoveryLocation() ??
                  ({ mode: "browse", label: "Browsing all areas" } as const);
                const next = saved ?? {
                  query: "",
                  radiusKm: 5,
                  radiusMode: "auto" as const,
                  categorySlug: null,
                  location,
                };
                writeDiscoveryState({ ...next, categorySlug: c.slug, location });
                markListingEntry("category", listingId);
                trackKfEvent("CATEGORY_BROWSE", { categoryId: c.id, regionLabel: `from:${listingId}` });
              }}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden />
              <span>{c.name}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
