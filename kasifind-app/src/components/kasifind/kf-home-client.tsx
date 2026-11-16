"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Loader2, Search, SlidersHorizontal, Store, X } from "lucide-react";
import { KfProviderListingActions } from "@/components/kasifind/kf-provider-listing-actions";
import type { KfCategory, KfSearchResult } from "@/components/kasifind/types";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { KfProviderCard } from "@/components/kasifind/kf-provider-card";
import { useListingContactCtaLabels } from "@/components/kasifind/use-listing-contact-cta-labels";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { trackKfEvent } from "@/lib/kasifind/track-client";
import { readLocationConsent, writeLocationConsent } from "@/lib/kasifind/location-consent-storage";
import {
  readDiscoveryState,
  writeDiscoveryState,
  type KfDiscoveryLocation,
  type KfRadiusMode,
} from "@/lib/kasifind/discovery-state";
import { useDiscoveryScrollRestore } from "@/components/kasifind/use-discovery-scroll-restore";
import {
  readDiscoveryScroll,
  scrollDiscoveryToTop,
} from "@/lib/kasifind/discovery-scroll";
import { useDebouncedValue } from "@/components/kasifind/use-debounced-value";
import { useHomeSearchBarPin } from "@/components/kasifind/use-home-search-bar-pin";
import {
  DISCOVERY_RADIUS_CHIPS_KM,
  formatDiscoveryResultsSubtitle,
  radiusChipLabel,
} from "@/lib/kasifind/discovery-display";
import { BROWSE_LISTING_LIMIT } from "@/lib/kasifind/discovery-config";
import {
  KfDiscoveryScopeSwitch,
  type DiscoverySearchScope,
} from "@/components/kasifind/kf-discovery-scope-switch";
import { KfLocationConsentDialog } from "@/components/kasifind/kf-location-consent-dialog";
import { KfLocationSheet } from "@/components/kasifind/kf-location-sheet";
import type { GeocodeHit } from "@/lib/kasifind/geocode-utils";
import { KfCategoryFlashIntro } from "@/components/kasifind/kf-category-flash-intro";
import {
  CATEGORY_FLASH_MIN_SLIDES,
  shouldPlayCategoryFlashIntro,
  type CategoryFlashSlide,
} from "@/lib/kasifind/category-flash-intro";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const BROWSE_LOCATION_LABEL = "Browsing all areas";
const GPS_LOCATION_LABEL = "Near me";

type LocationState =
  | { mode: "browse"; label: string }
  | { mode: "gps"; lat: number; lng: number; label: string }
  | { mode: "manual"; lat: number; lng: number; label: string };

function discoveryScopeFromLocation(
  location: LocationState,
  locating: boolean,
  areaPickerOpen: boolean
): DiscoverySearchScope {
  if (areaPickerOpen || location.mode === "manual") return "area";
  if (locating || location.mode === "gps") return "near";
  return "nationwide";
}

function isLegacyDefaultManualCenter(loc: KfDiscoveryLocation): boolean {
  return (
    loc.mode === "manual" &&
    loc.lat === DEFAULT_CENTER.lat &&
    loc.lng === DEFAULT_CENTER.lng
  );
}

function ResultSkeletons() {
  return (
    <ul className="grid gap-4 sm:grid-cols-2" aria-hidden>
      {[1, 2].map((i) => (
        <li key={i} className="kf-card overflow-hidden p-0">
          <div className="kf-skeleton aspect-[4/3] w-full rounded-none" />
          <div className="space-y-2 p-4">
            <div className="kf-skeleton h-4 w-2/3" />
            <div className="kf-skeleton h-3 w-1/2" />
          </div>
        </li>
      ))}
    </ul>
  );
}

export type KfProviderListCta = {
  href: string;
  label: string;
  hint: string;
  listingId?: string | null;
  displayName?: string | null;
  shareEnabled?: boolean;
};

export function KfHomeClient({
  dbConfigured,
  categoryFlashSlides = [],
  providerListCta = null,
}: {
  dbConfigured: boolean;
  categoryFlashSlides?: CategoryFlashSlide[];
  providerListCta?: KfProviderListCta | null;
}) {
  const [location, setLocation] = useState<LocationState>({
    mode: "browse",
    label: BROWSE_LOCATION_LABEL,
  });
  const [locating, setLocating] = useState(false);
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [radiusMode, setRadiusMode] = useState<KfRadiusMode>("auto");
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<KfCategory[]>([]);
  const [results, setResults] = useState<KfSearchResult[]>([]);
  const [searchMeta, setSearchMeta] = useState<{
    expanded: boolean;
    radiusKm: number;
    browse?: boolean;
    includesSurroundingAreas?: boolean;
    coverageExhausted?: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const searchGenerationRef = useRef(0);
  const lastLiveQueryRef = useRef<string | null>(null);
  const searchPinAnchorRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const debouncedQuery = useDebouncedValue(query, 400);
  const searchBarPin = useHomeSearchBarPin(searchPinAnchorRef, searchBarRef);
  const [searchHasRun, setSearchHasRun] = useState(false);
  const slidesEligibleForIntro =
    categoryFlashSlides.length >= CATEGORY_FLASH_MIN_SLIDES;
  const [introGate, setIntroGate] = useState<"pending" | "play" | "off">(() =>
    slidesEligibleForIntro ? "pending" : "off"
  );
  const dismissCategoryFlash = useCallback(() => setIntroGate("off"), []);

  useLayoutEffect(() => {
    if (!slidesEligibleForIntro) {
      setIntroGate("off");
      return;
    }
    setIntroGate(shouldPlayCategoryFlashIntro() ? "play" : "off");
  }, [slidesEligibleForIntro]);

  useEffect(() => {
    const saved = readDiscoveryState();
    if (saved) {
      setQuery(saved.query);
      setRadiusKm(saved.radiusKm);
      setRadiusMode(saved.radiusMode ?? "auto");
      setCategorySlug(saved.categorySlug);
      if (saved.location) {
        let restored: LocationState = saved.location;
        if (isLegacyDefaultManualCenter(saved.location)) {
          restored = { mode: "browse", label: BROWSE_LOCATION_LABEL };
        }
        setLocation(restored);
      } else {
        const consent = readLocationConsent();
        if (consent === "dismissed" || consent === "denied") {
          setLocation({ mode: "browse", label: BROWSE_LOCATION_LABEL });
        }
      }
    }
    setFiltersHydrated(true);
  }, []);

  useDiscoveryScrollRestore({
    ready: filtersHydrated,
    loading,
    hasSearchRun: searchHasRun,
  });

  useEffect(() => {
    if (!filtersHydrated) return;
    writeDiscoveryState({ query, radiusKm, radiusMode, categorySlug, location });
  }, [query, radiusKm, radiusMode, categorySlug, location, filtersHydrated]);

  useEffect(() => {
    if (!dbConfigured) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => undefined);
  }, [dbConfigured]);

  const usesBrowseMode = location.mode === "browse";

  const impressionScopeKey = useMemo(() => {
    if (results.length === 0) return null;
    const effectiveRadius = searchMeta?.browse ? "browse" : String(searchMeta?.radiusKm ?? radiusKm);
    const geoKey =
      location.mode === "browse"
        ? "browse"
        : `${location.lat.toFixed(3)},${location.lng.toFixed(3)}`;
    return [
      query.trim(),
      categorySlug ?? "",
      effectiveRadius,
      geoKey,
      results.map((r) => r.id).join(","),
    ].join("|");
  }, [query, categorySlug, searchMeta, radiusKm, location, results]);

  const resultListingIds = useMemo(() => results.map((r) => r.id), [results]);
  const contactCtaLabels = useListingContactCtaLabels(resultListingIds, impressionScopeKey);

  const switchToBrowseMode = useCallback(() => {
    setLocation({ mode: "browse", label: BROWSE_LOCATION_LABEL });
  }, []);

  const openAreaPicker = useCallback(() => {
    setLocationSheetOpen(true);
  }, []);

  const requestNearMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support location. Pick an area under Set location.");
      openAreaPicker();
      return;
    }
    setLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        writeLocationConsent("granted");
        setLocation({
          mode: "gps",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: GPS_LOCATION_LABEL,
        });
        setLocationSheetOpen(false);
        setLocationDialogOpen(false);
        setLocating(false);
      },
      (err) => {
        if (err.code === 1) {
          writeLocationConsent("denied");
          setError("Location blocked — choose Set location or Nationwide.");
        }
        setLocationDialogOpen(false);
        setLocating(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 }
    );
  }, [openAreaPicker]);

  const dismissLocationPrompt = useCallback(() => {
    writeLocationConsent("dismissed");
    switchToBrowseMode();
    setLocationDialogOpen(false);
  }, [switchToBrowseMode]);

  const confirmNearMeFromDialog = useCallback(() => {
    writeLocationConsent("granted");
    requestNearMe();
  }, [requestNearMe]);

  const startNearMeWithConsent = useCallback(() => {
    if (locating) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support location. Pick an area under Set location.");
      openAreaPicker();
      return;
    }
    const consent = readLocationConsent();
    if (consent === "granted") {
      requestNearMe();
      return;
    }
    if (consent === "denied") {
      setError("Location blocked — choose Set location or Nationwide.");
      return;
    }

    const openDialog = () => setLocationDialogOpen(true);

    if (navigator.permissions?.query) {
      void navigator.permissions
        .query({ name: "geolocation" })
        .then((status) => {
          if (status.state === "granted") {
            writeLocationConsent("granted");
            requestNearMe();
            return;
          }
          if (status.state === "denied") {
            writeLocationConsent("denied");
            setError("Location blocked — choose Set location or Nationwide.");
            return;
          }
          openDialog();
        })
        .catch(() => openDialog());
      return;
    }

    openDialog();
  }, [locating, openAreaPicker, requestNearMe]);

  const handleScopeSelect = useCallback(
    (scope: DiscoverySearchScope) => {
      if (scope === "nationwide") {
        switchToBrowseMode();
        setLocationSheetOpen(false);
        setLocationDialogOpen(false);
        return;
      }
      if (scope === "near") {
        startNearMeWithConsent();
        return;
      }
      openAreaPicker();
    },
    [openAreaPicker, startNearMeWithConsent, switchToBrowseMode]
  );

  type RunSearchOpts = {
    preferAutoExpand?: boolean;
    query?: string;
    categorySlug?: string | null;
    radiusKm?: number;
    radiusMode?: KfRadiusMode;
    /** Scroll to top when results land (default true). Set false for background refresh / scroll restore. */
    scrollToTop?: boolean;
  };

  const runSearch = useCallback(
    async (opts?: RunSearchOpts) => {
      if (!dbConfigured) {
        setError("KasiFind database is not configured on this server.");
        return;
      }
      const q = (opts?.query !== undefined ? opts.query : query).trim();
      const cat = opts?.categorySlug !== undefined ? opts.categorySlug : categorySlug;
      const km = opts?.radiusKm ?? radiusKm;
      const mode = opts?.radiusMode ?? radiusMode;

      const generation = ++searchGenerationRef.current;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q });
        if (cat) params.set("category", cat);

        if (location.mode === "browse") {
          params.set("browse", "1");
          params.set("limit", String(BROWSE_LISTING_LIMIT));
        } else {
          const useAutoExpand =
            opts?.preferAutoExpand === true ||
            (opts?.preferAutoExpand !== false && mode === "auto");
          params.set("lat", String(location.lat));
          params.set("lng", String(location.lng));
          params.set("radiusKm", String(km));
          params.set("autoExpand", useAutoExpand ? "1" : "0");
        }

        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (generation !== searchGenerationRef.current) return;
        if (!res.ok) {
          setError(data.error ?? "Search failed.");
          setResults([]);
          return;
        }
        setResults(data.results ?? []);
        if (data.browse) {
          setSearchMeta({ browse: true, expanded: false, radiusKm: 0 });
        } else {
          setSearchMeta({
            expanded: Boolean(data.expanded),
            radiusKm: data.radiusKm ?? km,
            includesSurroundingAreas: Boolean(data.includesSurroundingAreas),
            coverageExhausted: Boolean(data.coverageExhausted),
          });
        }
        trackKfEvent("SEARCH", {
          query: q || undefined,
          regionLabel: location.mode === "browse" ? "Nationwide (no location)" : location.label,
        });
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        if (generation === searchGenerationRef.current) {
          setSearchHasRun(true);
          const shouldScrollToTop = opts?.scrollToTop !== false && !readDiscoveryScroll();
          if (shouldScrollToTop) scrollDiscoveryToTop();
        }
        setLoading(false);
      }
    },
    [categorySlug, dbConfigured, location, query, radiusKm, radiusMode]
  );

  const clearAllFilters = useCallback(() => {
    setQuery("");
    lastLiveQueryRef.current = "";
    setCategorySlug(null);
    void runSearch({ preferAutoExpand: true, query: "", categorySlug: null });
  }, [runSearch]);

  useEffect(() => {
    if (!categorySlug || !dbConfigured) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) trackKfEvent("CATEGORY_BROWSE", { categoryId: cat.id });
  }, [categorySlug, categories, dbConfigured]);

  useEffect(() => {
    if (!dbConfigured || !filtersHydrated) return;
    void runSearch({ scrollToTop: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when location source changes
  }, [dbConfigured, filtersHydrated, location]);

  useEffect(() => {
    if (!dbConfigured || !filtersHydrated) return;
    if (lastLiveQueryRef.current === null) {
      lastLiveQueryRef.current = debouncedQuery;
      return;
    }
    if (lastLiveQueryRef.current === debouncedQuery) return;
    lastLiveQueryRef.current = debouncedQuery;
    void runSearch({ query: debouncedQuery, preferAutoExpand: true });
  }, [dbConfigured, debouncedQuery, filtersHydrated, runSearch]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;

    let cancelled = false;
    let statusRef: PermissionStatus | null = null;
    let onPermissionChange: (() => void) | null = null;

    void navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled) return;
      statusRef = status;
      const syncPermission = () => {
        if (status.state === "granted") {
          writeLocationConsent("granted");
          return;
        }
        if (status.state === "denied") {
          writeLocationConsent("denied");
          setLocation((prev) =>
            prev.mode === "gps" ? { mode: "browse", label: BROWSE_LOCATION_LABEL } : prev
          );
          return;
        }
      };
      onPermissionChange = () => {
        syncPermission();
      };
      syncPermission();
      status.addEventListener("change", onPermissionChange);
    });

    return () => {
      cancelled = true;
      if (statusRef && onPermissionChange)
        statusRef.removeEventListener("change", onPermissionChange);
    };
  }, []);

  const radiusSummaryLabel = radiusMode === "auto" ? radiusChipLabel("auto") : radiusChipLabel(radiusKm);

  const discoveryScope = discoveryScopeFromLocation(location, locating, locationSheetOpen);
  const manualAreaHint =
    location.mode === "manual"
      ? location.label.split(",")[0]?.trim() || location.label
      : null;

  const resultsSubtitle = useMemo(
    () =>
      formatDiscoveryResultsSubtitle({
        location,
        radiusMode,
        selectedRadiusKm: radiusKm,
        searchMeta,
      }),
    [location, radiusMode, radiusKm, searchMeta]
  );

  const activeCategoryName = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name ?? categorySlug
    : null;
  const hasActiveFilters = Boolean(query.trim() || categorySlug);

  if (!dbConfigured) {
    return (
      <div className="kf-card p-6 kf-animate-in">
        <h1 className="kf-section-title">KasiFind</h1>
        <p className="mt-2 text-sm text-[var(--kf-muted)]">
          Set <code className="text-xs">KASIFIND_DATABASE_URL</code> on the server, run migrations,
          and redeploy to enable search.
        </p>
      </div>
    );
  }

  return (
    <div className="kf-home-landing pb-4">
      {introGate === "pending" && slidesEligibleForIntro ? (
        <div className="kf-category-flash kf-category-flash--page-veil" aria-hidden role="presentation" />
      ) : null}
      {introGate === "play" ? (
        <KfCategoryFlashIntro
          slides={categoryFlashSlides}
          onComplete={dismissCategoryFlash}
        />
      ) : null}
      <KfLocationConsentDialog
        open={locationDialogOpen}
        busy={locating}
        onClose={dismissLocationPrompt}
        onConfirm={confirmNearMeFromDialog}
        onChooseArea={() => {
          setLocationDialogOpen(false);
          openAreaPicker();
        }}
      />
      <KfLocationSheet
        open={locationSheetOpen}
        areaOnly
        onClose={() => setLocationSheetOpen(false)}
        onAreaSelected={(place: GeocodeHit) => {
          const shortLabel = place.label.split(",")[0]?.trim() || place.label;
          setLocation({
            mode: "manual",
            lat: place.latitude,
            lng: place.longitude,
            label: shortLabel,
          });
          setLocationSheetOpen(false);
          setError(null);
          void runSearch({ preferAutoExpand: true });
        }}
        areaSearchInitialQuery={location.mode === "manual" ? location.label : ""}
      />
      <div className="kf-home-search-stack">
      <section className="kf-hero kf-hero--landing kf-animate-in">
        <div className="kf-hero-bg" aria-hidden />
        <p className="kf-hero-kicker">Find local. Support local. Grow local.</p>
        <h1 className="kf-hero-title">Your next great local find is closer than you think.</h1>
      </section>

      {hasActiveFilters ? (
        <div className="kf-active-filters kf-animate-in" aria-label="Active search filters">
          <p className="kf-active-filters-label">Filtering results</p>
          {query.trim() ? (
            <span className="kf-filter-chip">
              &ldquo;{query.trim()}&rdquo;
              <button
                type="button"
                className="kf-filter-chip-dismiss"
                aria-label="Clear search text"
                onClick={() => {
                  setQuery("");
                  lastLiveQueryRef.current = "";
                  void runSearch({ preferAutoExpand: true, query: "" });
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ) : null}
          {activeCategoryName ? (
            <span className="kf-filter-chip">
              {activeCategoryName}
              <button
                type="button"
                className="kf-filter-chip-dismiss"
                aria-label="Clear category filter"
                onClick={() => {
                  setCategorySlug(null);
                  void runSearch({ preferAutoExpand: true, categorySlug: null });
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ) : null}
          {query.trim() && activeCategoryName ? (
            <button type="button" className="kf-filter-clear-all" onClick={clearAllFilters}>
              Clear all
            </button>
          ) : null}
        </div>
      ) : null}

      <div ref={searchPinAnchorRef} className="kf-home-search-pin-anchor" aria-hidden />
      {searchBarPin.pinned && searchBarPin.placeholderHeight > 0 ? (
        <div
          className="kf-home-search-placeholder"
          style={{ height: searchBarPin.placeholderHeight }}
          aria-hidden
        />
      ) : null}
      <div
        ref={searchBarRef}
        className={`kf-home-search-sticky kf-home-search-sticky--inner${
          searchBarPin.pinned ? " kf-home-search-sticky--pinned" : ""
        }${searchBarPin.pinned && searchBarPin.hidden ? " kf-home-search-sticky--hidden" : ""}`}
      >
        <form
          className="kf-hero-search-card kf-hero-search-card--sticky kf-animate-in"
          style={{ animationDelay: "60ms" }}
          onSubmit={(e) => {
            e.preventDefault();
            lastLiveQueryRef.current = query;
            void runSearch({ preferAutoExpand: true });
          }}
          role="search"
          aria-label="Find local services"
        >
          <p className="kf-hero-search-title">Find a local service</p>
          <KfDiscoveryScopeSwitch
            scope={discoveryScope}
            locating={locating}
            areaHint={manualAreaHint}
            onSelect={handleScopeSelect}
          />
          <div className="kf-search-shell">
            <Search className="h-5 w-5 shrink-0 text-[var(--kf-forest)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Steel gates, plumber, mechanic…"
              className="kf-search-input"
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Search for a service"
            />
            {query ? (
              <button
                type="button"
                className="kf-btn kf-btn-ghost min-h-[2.25rem] px-2"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  lastLiveQueryRef.current = "";
                  void runSearch({ preferAutoExpand: true, query: "" });
                }}
              >
                <X className="h-5 w-5" />
              </button>
            ) : null}
          </div>
          <p className="kf-live-search-hint" aria-live="polite">
            {loading ? "Updating results…" : "Results update as you type."}
          </p>
        </form>
      </div>

      <div className="kf-hero-search-extras">
        <details
          className={`kf-radius-disclosure${usesBrowseMode ? " kf-radius-disclosure--disabled" : ""}`}
        >
          <summary className="kf-radius-disclosure-summary">
            <SlidersHorizontal className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
            <span>
              Search distance: <strong>{usesBrowseMode ? "—" : radiusSummaryLabel}</strong>
            </span>
            <ChevronDown className="kf-radius-disclosure-chevron h-4 w-4 shrink-0" aria-hidden />
          </summary>
          <div className={`kf-radius-field${usesBrowseMode ? " kf-radius-field--disabled" : ""}`}>
            {usesBrowseMode ? (
              <p className="text-xs text-[var(--kf-muted)]">
                Choose{" "}
                <button
                  type="button"
                  className="kf-link font-semibold underline"
                  onClick={() => handleScopeSelect("near")}
                >
                  Near me
                </button>{" "}
                or{" "}
                <button
                  type="button"
                  className="kf-link font-semibold underline"
                  onClick={() => handleScopeSelect("area")}
                >
                  Set location
                </button>{" "}
                to filter by distance.
              </p>
            ) : (
              <p className="text-xs text-[var(--kf-muted)]">
                Auto expands gently if there aren&apos;t many listings nearby (up to 50 km).
              </p>
            )}
            <div className="kf-radius-chips" role="group" aria-label="Search radius">
              <button
                type="button"
                disabled={usesBrowseMode}
                onClick={() => {
                  if (usesBrowseMode) {
                    handleScopeSelect("near");
                    return;
                  }
                  setRadiusMode("auto");
                  void runSearch({ preferAutoExpand: true, radiusMode: "auto" });
                }}
                className={`kf-chip kf-radius-chip ${radiusMode === "auto" ? "kf-chip-active" : ""}`}
              >
                Auto
              </button>
              {DISCOVERY_RADIUS_CHIPS_KM.map((r) => (
                <button
                  key={r}
                  type="button"
                  disabled={usesBrowseMode}
                  onClick={() => {
                    if (usesBrowseMode) {
                      handleScopeSelect("near");
                      return;
                    }
                    setRadiusMode("fixed");
                    setRadiusKm(r);
                    void runSearch({
                      preferAutoExpand: false,
                      radiusKm: r,
                      radiusMode: "fixed",
                    });
                  }}
                  className={`kf-chip kf-radius-chip ${radiusMode === "fixed" && radiusKm === r ? "kf-chip-active" : ""}`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>
        </details>
      </div>

      {providerListCta ? (
        <div className="kf-home-provider-cta kf-animate-in">
          <KfProviderListingActions
            manageHref={providerListCta.href}
            manageLabel={providerListCta.label}
            listingId={providerListCta.listingId ?? null}
            displayName={providerListCta.displayName ?? null}
            shareEnabled={Boolean(providerListCta.shareEnabled)}
            layout="inline"
            hint={providerListCta.listingId ? providerListCta.hint : null}
          />
          {!providerListCta.listingId ? (
            <p className="kf-home-provider-hint">{providerListCta.hint}</p>
          ) : null}
        </div>
      ) : null}

      {categories.length > 0 ? (
        <section className="kf-home-categories kf-animate-in">
          <h2 className="kf-section-title">Browse by category</h2>
          <p className="kf-section-sub">Tap a trade to filter nearby results.</p>
          <div className="kf-category-scroll" role="list">
            <button
              type="button"
              role="listitem"
              onClick={() => {
                setCategorySlug(null);
                void runSearch({ categorySlug: null });
              }}
              className={`kf-category-tile ${!categorySlug ? "kf-category-tile-active" : ""}`}
            >
              <span className="kf-category-icon">
                <Search className="h-5 w-5" />
              </span>
              <span className="kf-category-label">All</span>
            </button>
            {categories.map((c) => {
              const Icon = categoryIconForSlug(c.slug);
              return (
                <button
                  key={c.id}
                  type="button"
                  role="listitem"
                  onClick={() => {
                    setCategorySlug(c.slug);
                    void runSearch({ categorySlug: c.slug });
                  }}
                  className={`kf-category-tile ${categorySlug === c.slug ? "kf-category-tile-active" : ""}`}
                >
                  <span className="kf-category-icon">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="kf-category-label">{c.name}</span>
                </button>
              );
            })}
          </div>
        </section>
      ) : null}
      </div>

      {error ? <div className="kf-alert-error">{error}</div> : null}

      <section aria-live="polite" className="kf-home-results kf-animate-in">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="kf-section-title">
              {usesBrowseMode ? "All providers" : "Nearby providers"}
            </h2>
            <p className="kf-section-sub mt-0.5">{resultsSubtitle.primary}</p>
            {resultsSubtitle.secondary ? (
              <p className="mt-1 text-xs text-[var(--kf-muted-fg)]">{resultsSubtitle.secondary}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-4">
          {loading && results.length === 0 ? (
            <ResultSkeletons />
          ) : results.length === 0 ? (
            <KfEmptyState
              icon={<Store className="h-6 w-6" aria-hidden />}
              title="Nobody listed here yet"
              description={
                searchMeta?.coverageExhausted
                  ? "KasiFind is still growing here — nothing matched within about 50 km. Try another category, choose a different area, or browse all listings."
                  : usesBrowseMode
                    ? "No listings matched your filters nationwide. Try another category or clear your search."
                    : radiusMode === "fixed"
                      ? "Nothing matched within your selected distance. Try Auto search, a wider radius, or another area."
                      : "KasiFind is still growing in this area. Try another category, choose another area, or list a business — it is free."
              }
              action={
                <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
                  {!usesBrowseMode && !searchMeta?.coverageExhausted && radiusMode === "fixed" ? (
                    <button
                      type="button"
                      className="kf-btn kf-btn-primary"
                      onClick={() => {
                        setRadiusMode("auto");
                        void runSearch({ preferAutoExpand: true, radiusMode: "auto" });
                      }}
                    >
                      Try auto search
                    </button>
                  ) : null}
                  {!usesBrowseMode && !searchMeta?.coverageExhausted ? (
                    <button
                      type="button"
                      className="kf-btn kf-btn-primary"
                      onClick={() => void runSearch({ preferAutoExpand: true })}
                    >
                      Search wider area
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="kf-btn kf-btn-outline"
                    onClick={() => handleScopeSelect("area")}
                  >
                    Set location
                  </button>
                  {usesBrowseMode ? null : (
                    <button
                      type="button"
                      className="kf-btn kf-btn-outline"
                      onClick={() => handleScopeSelect("nationwide")}
                    >
                      Browse nationwide
                    </button>
                  )}
                  <Link href="/account/listing" className="kf-btn kf-btn-outline">
                    List your business
                  </Link>
                </div>
              }
            />
          ) : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {results.map((p, i) => (
                <KfProviderCard
                  key={p.id}
                  provider={p}
                  serviceHint={p.services[0]?.name ?? query}
                  index={i}
                  impressionScopeKey={impressionScopeKey}
                  contactCtaLabel={contactCtaLabels.get(p.id)}
                  preserveDiscoveryScroll
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
