"use client";

import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import type { KfCategory, KfSearchResult } from "@/components/kasifind/types";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { KfProviderCard } from "@/components/kasifind/kf-provider-card";
import { useListingContactCtaLabels } from "@/components/kasifind/use-listing-contact-cta-labels";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { trackKfEvent } from "@/lib/kasifind/track-client";
import { KfLocationConsentDialog } from "@/components/kasifind/kf-location-consent-dialog";
import {
  clearLocationConsent,
  readLocationConsent,
  writeLocationConsent,
} from "@/lib/kasifind/location-consent-storage";
import {
  readDiscoveryState,
  writeDiscoveryState,
  type KfDiscoveryLocation,
  type KfRadiusMode,
} from "@/lib/kasifind/discovery-state";
import {
  DISCOVERY_RADIUS_CHIPS_KM,
  formatDiscoveryResultsSubtitle,
  locationModeLabel,
} from "@/lib/kasifind/discovery-display";
import { KfLocationSheet } from "@/components/kasifind/kf-location-sheet";
import type { GeocodeHit } from "@/lib/kasifind/geocode-utils";
import { KfCategoryFlashIntro } from "@/components/kasifind/kf-category-flash-intro";
import {
  CATEGORY_FLASH_MIN_SLIDES,
  shouldPlayCategoryFlashIntro,
  type CategoryFlashSlide,
} from "@/lib/kasifind/category-flash-intro";
import {
  KF_LOCATION_CONSENT_AFTER_INTRO_MS,
  shouldDeferHomeLocationConsentPrompt,
} from "@/lib/kasifind/location-consent-prompt-timing";
import { shouldSkipAutoGpsOnHomeLoad } from "@/lib/kasifind/location-consent-restore";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const BROWSE_LOCATION_LABEL = "Browsing all areas";
const GPS_LOCATION_LABEL = "Near me";

type LocationState =
  | { mode: "browse"; label: string }
  | { mode: "gps"; lat: number; lng: number; label: string }
  | { mode: "manual"; lat: number; lng: number; label: string };

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
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
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
  const [locationSheetOpen, setLocationSheetOpen] = useState(false);
  const [locationSheetView, setLocationSheetView] = useState<"menu" | "area">("menu");
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const searchGenerationRef = useRef(0);
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
  const usesApproximateDistance = location.mode === "manual";

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

  const dismissLocationPrompt = useCallback(() => {
    writeLocationConsent("dismissed");
    switchToBrowseMode();
    setLocationDialogOpen(false);
  }, [switchToBrowseMode]);

  const openLocationSheet = useCallback((view: "menu" | "area" = "menu") => {
    setLocationSheetView(view);
    setLocationSheetOpen(true);
  }, []);

  const requestNearMeRef = useRef<() => void>(() => undefined);

  const requestNearMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support location. Search for an area instead.");
      openLocationSheet("area");
      setLocationDialogOpen(false);
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
        setLocating(false);
        setLocationDialogOpen(false);
      },
      (err) => {
        if (err.code === 1) {
          writeLocationConsent("denied");
        }
        switchToBrowseMode();
        openLocationSheet("area");
        setLocating(false);
        setLocationDialogOpen(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 }
    );
  }, [openLocationSheet, switchToBrowseMode]);

  requestNearMeRef.current = requestNearMe;

  const confirmLocationFromDialog = useCallback(() => {
    requestNearMe();
  }, [requestNearMe]);

  const runSearch = useCallback(
    async (opts?: { preferAutoExpand?: boolean }) => {
      if (!dbConfigured) {
        setError("KasiFind database is not configured on this server.");
        return;
      }
      const generation = ++searchGenerationRef.current;
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ q: query.trim() });
        if (categorySlug) params.set("category", categorySlug);

        if (location.mode === "browse") {
          params.set("browse", "1");
        } else {
          const useAutoExpand =
            opts?.preferAutoExpand === true ||
            (opts?.preferAutoExpand !== false && radiusMode === "auto");
          params.set("lat", String(location.lat));
          params.set("lng", String(location.lng));
          params.set("radiusKm", String(radiusKm));
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
            radiusKm: data.radiusKm ?? radiusKm,
            includesSurroundingAreas: Boolean(data.includesSurroundingAreas),
            coverageExhausted: Boolean(data.coverageExhausted),
          });
        }
        trackKfEvent("SEARCH", {
          query: query.trim() || undefined,
          regionLabel: location.mode === "browse" ? "Nationwide (no location)" : location.label,
        });
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, dbConfigured, location, query, radiusKm, radiusMode]
  );

  useEffect(() => {
    if (!categorySlug || !dbConfigured) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) trackKfEvent("CATEGORY_BROWSE", { categoryId: cat.id });
  }, [categorySlug, categories, dbConfigured]);

  useEffect(() => {
    if (!dbConfigured || !filtersHydrated) return;
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when location source changes
  }, [dbConfigured, filtersHydrated, location]);

  useEffect(() => {
    if (!dbConfigured) return;
    if (shouldDeferHomeLocationConsentPrompt(introGate)) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const consent = readLocationConsent();

    if (consent === "granted") {
      const restored = readDiscoveryState()?.location;
      if (shouldSkipAutoGpsOnHomeLoad(consent, restored)) {
        return;
      }
      const hasRestoredGps = restored?.mode === "gps";
      if (!hasRestoredGps) setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            mode: "gps",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: GPS_LOCATION_LABEL,
          });
          setLocating(false);
        },
        (err) => {
          setLocating(false);
          if (err.code === 1) {
            writeLocationConsent("denied");
          }
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 600_000 }
      );
      return;
    }

    if (consent === "dismissed" || consent === "denied") return;

    const timer = window.setTimeout(() => {
      setLocationDialogOpen(true);
    }, KF_LOCATION_CONSENT_AFTER_INTRO_MS);

    return () => window.clearTimeout(timer);
  }, [dbConfigured, introGate]);

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
          setLocation({ mode: "browse", label: BROWSE_LOCATION_LABEL });
          return;
        }
      };
      onPermissionChange = () => {
        if (status.state === "prompt" && readLocationConsent() === "granted") {
          clearLocationConsent();
        }
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

  const geolocationAvailable =
    typeof navigator !== "undefined" && Boolean(navigator.geolocation);
  const locationPill = useMemo(() => {
    if (locating) {
      return (
        <span className="kf-location-pill">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finding your area…
        </span>
      );
    }
    return (
      <button
        type="button"
        className="kf-location-pill kf-location-pill--approx"
        onClick={() => openLocationSheet("menu")}
      >
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {locationModeLabel(location)}
      </button>
    );
  }, [location, locating, openLocationSheet]);

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
    <div className="space-y-8 pb-4">
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
        subtle
        busy={locating}
        onClose={dismissLocationPrompt}
        onConfirm={confirmLocationFromDialog}
        onChooseArea={() => openLocationSheet("area")}
      />
      <KfLocationSheet
        open={locationSheetOpen}
        onClose={() => {
          setLocationSheetOpen(false);
          setLocationSheetView("menu");
        }}
        location={location}
        locating={locating}
        geolocationAvailable={geolocationAvailable}
        permissionDenied={readLocationConsent() === "denied"}
        view={locationSheetView}
        onViewChange={setLocationSheetView}
        onUseGps={() => {
          if (readLocationConsent() === "granted") {
            requestNearMe();
            return;
          }
          setLocationSheetOpen(false);
          setLocationDialogOpen(true);
        }}
        onBrowseAll={() => {
          writeLocationConsent("dismissed");
          switchToBrowseMode();
          setLocationSheetOpen(false);
          setLocationSheetView("menu");
        }}
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
      <section className="kf-hero kf-animate-in">
        <div className="kf-hero-bg" aria-hidden />
        <p className="kf-hero-kicker">Find local. Support local.</p>
        <h1 className="kf-hero-title mt-2">Your next great local find is closer than you think.</h1>
        <p className="kf-hero-lead">
          Discover trusted local services, skilled artisans and businesses around you.
        </p>
        {providerListCta ? (
          <div className="kf-hero-provider-cta kf-animate-in">
            <Link href={providerListCta.href} className="kf-btn kf-btn-primary kf-hero-provider-btn">
              <PlusCircle className="h-5 w-5 shrink-0" aria-hidden />
              {providerListCta.label}
            </Link>
            <p className="kf-hero-provider-hint">{providerListCta.hint}</p>
          </div>
        ) : null}
        {locationPill}
      </section>

      {usesBrowseMode ? (
        <div className="kf-alert-info kf-animate-in" role="status">
          <strong>Browsing all areas.</strong> Results are not sorted by distance. Tap{" "}
          <button type="button" className="kf-link font-semibold underline" onClick={() => openLocationSheet("menu")}>
            {locationModeLabel(location)}
          </button>{" "}
          to search near you or pick a town.
        </div>
      ) : usesApproximateDistance ? (
        <div className="kf-alert-info kf-animate-in" role="status">
          <strong>Searching near {location.label}</strong> — not live GPS. Open{" "}
          <button type="button" className="kf-link font-semibold underline" onClick={() => openLocationSheet("menu")}>
            search location
          </button>{" "}
          to use your current location instead.
        </div>
      ) : null}

      {hasActiveFilters ? (
        <div className="kf-active-filters kf-animate-in" aria-label="Active search filters">
          {query.trim() ? (
            <span className="kf-filter-chip">
              Search: &ldquo;{query.trim()}&rdquo;
              <button
                type="button"
                className="kf-filter-chip-dismiss"
                aria-label="Clear search text"
                onClick={() => {
                  setQuery("");
                  void runSearch({ preferAutoExpand: true });
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
                  void runSearch({ preferAutoExpand: true });
                }}
              >
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </span>
          ) : null}
        </div>
      ) : null}

      <form
        className="kf-hero-search-card kf-animate-in space-y-4"
        style={{ animationDelay: "60ms" }}
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch();
        }}
        role="search"
        aria-label="Find local services"
      >
        <p className="text-sm font-semibold text-[var(--kf-charcoal)]">Search your area</p>
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
              onClick={() => setQuery("")}
            >
              <X className="h-5 w-5" />
            </button>
          ) : null}
        </div>

        <div className={`kf-radius-field${usesBrowseMode ? " kf-radius-field--disabled" : ""}`}>
          <span className="kf-radius-label">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            How far to search
          </span>
          {usesBrowseMode ? (
            <p className="text-xs text-[var(--kf-muted)]">
              Choose a search location to filter by distance.
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
                  openLocationSheet("menu");
                  return;
                }
                setRadiusMode("auto");
                void runSearch({ preferAutoExpand: true });
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
                    openLocationSheet("menu");
                    return;
                  }
                  setRadiusMode("fixed");
                  setRadiusKm(r);
                  void runSearch({ preferAutoExpand: false });
                }}
                className={`kf-chip kf-radius-chip ${radiusMode === "fixed" && radiusKm === r ? "kf-chip-active" : ""}`}
              >
                {r} km
              </button>
            ))}
          </div>
        </div>

        <button type="submit" disabled={loading} className="kf-btn kf-btn-primary w-full text-base">
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              Searching…
            </>
          ) : (
            <>
              <Search className="h-5 w-5" aria-hidden />
              {usesBrowseMode ? "Search all listings" : "Search nearby"}
            </>
          )}
        </button>
      </form>
      </div>

      {categories.length > 0 && (
        <section className="kf-animate-in" style={{ animationDelay: "120ms" }}>
          <h2 className="kf-section-title">Browse by category</h2>
          <p className="kf-section-sub mt-1">Tap a trade to filter nearby results.</p>
          <div className="kf-category-scroll mt-4" role="list">
            <button
              type="button"
              role="listitem"
              onClick={() => {
                setCategorySlug(null);
                void runSearch();
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
                    void runSearch();
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
      )}

      {error ? <div className="kf-alert-error">{error}</div> : null}

      <section aria-live="polite" className="kf-animate-in" style={{ animationDelay: "160ms" }}>
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
                        void runSearch({ preferAutoExpand: true });
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
                    onClick={() => openLocationSheet(location.mode === "browse" ? "menu" : "area")}
                  >
                    {usesBrowseMode ? "Choose search location" : "Change area"}
                  </button>
                  {usesBrowseMode ? null : (
                    <button type="button" className="kf-btn kf-btn-outline" onClick={switchToBrowseMode}>
                      Browse all areas
                    </button>
                  )}
                  <a href="/register" className="kf-btn kf-btn-outline">
                    List your business
                  </a>
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
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
