"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, ChevronRight, MapPin } from "lucide-react";
import type { KfSearchResult } from "@/components/kasifind/types";
import { formatDistanceKmClient } from "@/components/kasifind/format-distance";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { buildNearbyListingSearchUrl } from "@/lib/kasifind/listing-nearby-search";
import { markListingEntry } from "@/lib/kasifind/listing-page-attribution";
import { trackKfEvent } from "@/lib/kasifind/track-client";

type Props = {
  listingId: string;
  /** Prefer same trade when finding nearby listings. */
  categorySlug?: string | null;
};

const NEARBY_CARD_LIMIT = 3;

export function KfListingNearbySection({ listingId, categorySlug }: Props) {
  const [results, setResults] = useState<KfSearchResult[]>([]);
  const [mode, setMode] = useState<"browse" | "geo" | null>(null);
  const [areaLabel, setAreaLabel] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const trackedImpression = useRef(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const plan = buildNearbyListingSearchUrl(categorySlug ?? null);
      setMode(plan.mode);
      if (plan.mode === "geo") setAreaLabel(plan.label);
      const res = await fetch(plan.searchUrl);
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        return;
      }
      const rows = (data.results ?? []) as KfSearchResult[];
      const filtered = rows.filter((r) => r.id !== listingId).slice(0, NEARBY_CARD_LIMIT);
      setResults(filtered);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, listingId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || trackedImpression.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        trackedImpression.current = true;
        trackKfEvent("LISTING_NEARBY_SECTION_VIEW", { listingId });
        observer.disconnect();
      },
      { rootMargin: "0px 0px -20% 0px", threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [listingId]);

  const showDistance = mode === "geo";

  return (
    <section ref={sectionRef} className="mt-8 kf-animate-in" aria-labelledby="kf-nearby-title">
      <h2 id="kf-nearby-title" className="kf-section-title">
        More businesses near you
      </h2>
      <p className="kf-section-sub mt-1">
        {mode === "geo" && areaLabel
          ? `Other local listings around ${areaLabel}.`
          : "Explore more local businesses on KasiFind — no account needed."}
      </p>

      {loading ? (
        <ul className="kf-listing-nearby-grid mt-4" aria-busy="true" aria-label="Loading nearby listings">
          {[0, 1, 2].map((i) => (
            <li key={i} className="kf-listing-nearby-card kf-skeleton" aria-hidden />
          ))}
        </ul>
      ) : results.length === 0 ? (
        <p className="mt-4 text-sm text-[var(--kf-muted)]">
          No other listings matched right now. Try exploring all businesses on KasiFind.
        </p>
      ) : (
        <ul className="kf-listing-nearby-grid mt-4">
          {results.map((p) => {
            const Icon = categoryIconForSlug(p.categories[0]?.slug ?? "");
            const thumb = p.profileImageUrl ?? p.photoUrls[0] ?? null;
            const categoryName = p.categories[0]?.name;
            return (
              <li key={p.id}>
                <Link
                  href={`/providers/${p.id}`}
                  className="kf-listing-nearby-card group"
                  onClick={() => {
                    markListingEntry("nearby", listingId);
                    trackKfEvent("LISTING_DISCOVERY_CLICK", {
                      listingId: p.id,
                      regionLabel: `from:${listingId}`,
                    });
                  }}
                >
                  <div aria-hidden className="kf-listing-nearby-thumb">
                    {thumb ? (
                      <KfListingImage src={thumb} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <span className="kf-listing-nearby-thumb-placeholder">
                        <Building2 className="h-6 w-6 opacity-70" />
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold leading-tight text-[var(--kf-charcoal)] group-hover:text-[var(--kf-forest)]">
                      {p.displayName}
                    </p>
                    {categoryName ? (
                      <p className="mt-1 flex items-center gap-1 text-xs font-medium text-[var(--kf-forest)]">
                        <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                        {categoryName}
                      </p>
                    ) : null}
                    <p className="mt-1 flex items-center gap-1 text-xs text-[var(--kf-muted)]">
                      <MapPin className="h-3 w-3 shrink-0" aria-hidden />
                      <span className="truncate">{p.locationLabel}</span>
                      {showDistance && Number.isFinite(p.distanceKm) ? (
                        <span className="shrink-0 font-semibold text-[var(--kf-charcoal)]">
                          · {formatDistanceKmClient(p.distanceKm)}
                        </span>
                      ) : null}
                    </p>
                  </div>
                  <ChevronRight
                    className="h-5 w-5 shrink-0 text-[var(--kf-muted)] group-hover:text-[var(--kf-forest)]"
                    aria-hidden
                  />
                </Link>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-4">
        <Link href="/" className="kf-btn kf-btn-primary w-full sm:w-auto">
          Explore all nearby businesses
        </Link>
      </div>
    </section>
  );
}
