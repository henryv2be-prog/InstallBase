"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Loader2,
  MapPin,
  Navigation,
  Search,
  SlidersHorizontal,
  Store,
  X,
} from "lucide-react";
import type { KfCategory, KfSearchResult } from "@/components/kasifind/types";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { KfProviderCard } from "@/components/kasifind/kf-provider-card";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { trackKfEvent } from "@/lib/kasifind/track-client";
import { KfLocationConsentDialog } from "@/components/kasifind/kf-location-consent-dialog";
import {
  clearLocationConsent,
  readLocationConsent,
  writeLocationConsent,
} from "@/lib/kasifind/location-consent-storage";
import { readDiscoveryState, writeDiscoveryState } from "@/lib/kasifind/discovery-state";
import { KfCategoryFlashIntro } from "@/components/kasifind/kf-category-flash-intro";
import {
  CATEGORY_FLASH_MIN_SLIDES,
  shouldPlayCategoryFlashIntro,
  type CategoryFlashSlide,
} from "@/lib/kasifind/category-flash-intro";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

type LocationState =
  | { mode: "gps"; lat: number; lng: number; label: string }
  | { mode: "manual"; lat: number; lng: number; label: string };

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

export function KfHomeClient({
  dbConfigured,
  categoryFlashSlides = [],
}: {
  dbConfigured: boolean;
  categoryFlashSlides?: CategoryFlashSlide[];
}) {
  const [location, setLocation] = useState<LocationState>({
    mode: "manual",
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    label: "Approximate · Johannesburg",
  });
  const [locating, setLocating] = useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [categorySlug, setCategorySlug] = useState<string | null>(null);
  const [categories, setCategories] = useState<KfCategory[]>([]);
  const [results, setResults] = useState<KfSearchResult[]>([]);
  const [searchMeta, setSearchMeta] = useState<{ expanded: boolean; radiusKm: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualLat, setManualLat] = useState(String(DEFAULT_CENTER.lat));
  const [manualLng, setManualLng] = useState(String(DEFAULT_CENTER.lng));
  const [manualLabel, setManualLabel] = useState("Johannesburg area");
  const [filtersHydrated, setFiltersHydrated] = useState(false);
  const [categoryFlashPlaying, setCategoryFlashPlaying] = useState(false);
  const dismissCategoryFlash = useCallback(() => setCategoryFlashPlaying(false), []);

  useEffect(() => {
    if (
      categoryFlashSlides.length >= CATEGORY_FLASH_MIN_SLIDES &&
      shouldPlayCategoryFlashIntro()
    ) {
      setCategoryFlashPlaying(true);
    }
  }, [categoryFlashSlides.length]);

  useEffect(() => {
    const saved = readDiscoveryState();
    if (saved) {
      setQuery(saved.query);
      setRadiusKm(saved.radiusKm);
      setCategorySlug(saved.categorySlug);
    }
    setFiltersHydrated(true);
  }, []);

  useEffect(() => {
    if (!filtersHydrated) return;
    writeDiscoveryState({ query, radiusKm, categorySlug });
  }, [query, radiusKm, categorySlug, filtersHydrated]);

  useEffect(() => {
    if (!dbConfigured) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => undefined);
  }, [dbConfigured]);

  const usesApproximateDistance = location.mode !== "gps";

  const dismissLocationPrompt = useCallback(() => {
    writeLocationConsent("dismissed");
    setLocationDialogOpen(false);
  }, []);

  const openLocationPrompt = useCallback(() => {
    if (readLocationConsent() === "granted") {
      requestNearMeRef.current();
      return;
    }
    setLocationDialogOpen(true);
  }, []);

  const requestNearMeRef = useRef<() => void>(() => undefined);

  const requestNearMe = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("Your browser does not support location. Enter your area manually below.");
      setManualOpen(true);
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
          label: "Near you",
        });
        setLocating(false);
        setLocationDialogOpen(false);
      },
      (err) => {
        if (err.code === 1) {
          writeLocationConsent("denied");
        }
        setLocation({
          mode: "manual",
          lat: DEFAULT_CENTER.lat,
          lng: DEFAULT_CENTER.lng,
          label: "Location off — set your area",
        });
        setLocating(false);
        setLocationDialogOpen(false);
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 }
    );
  }, []);

  requestNearMeRef.current = requestNearMe;

  const confirmLocationFromDialog = useCallback(() => {
    requestNearMe();
  }, [requestNearMe]);

  const runSearch = useCallback(
    async (opts?: { autoExpand?: boolean }) => {
      if (!dbConfigured) {
        setError("KasiFind database is not configured on this server.");
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({
          q: query.trim(),
          lat: String(location.lat),
          lng: String(location.lng),
          radiusKm: String(radiusKm),
          autoExpand: opts?.autoExpand === false ? "0" : "1",
        });
        if (categorySlug) params.set("category", categorySlug);
        const res = await fetch(`/api/search?${params}`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? "Search failed.");
          setResults([]);
          return;
        }
        setResults(data.results ?? []);
        setSearchMeta({ expanded: Boolean(data.expanded), radiusKm: data.radiusKm ?? radiusKm });
        if (data.radiusKm && data.radiusKm !== radiusKm) setRadiusKm(data.radiusKm);
        trackKfEvent("SEARCH", {
          query: query.trim() || undefined,
          regionLabel: location.label,
        });
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, dbConfigured, location, query, radiusKm]
  );

  useEffect(() => {
    if (!categorySlug || !dbConfigured) return;
    const cat = categories.find((c) => c.slug === categorySlug);
    if (cat) trackKfEvent("CATEGORY_BROWSE", { categoryId: cat.id });
  }, [categorySlug, categories, dbConfigured]);

  useEffect(() => {
    if (!dbConfigured || !filtersHydrated) return;
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial / restored discovery
  }, [dbConfigured, filtersHydrated]);

  useEffect(() => {
    if (!dbConfigured) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) return;

    const consent = readLocationConsent();

    if (consent === "granted") {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLocation({
            mode: "gps",
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            label: "Near you",
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

    setLocationDialogOpen(true);
  }, [dbConfigured]);

  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;

    let cancelled = false;
    let statusRef: PermissionStatus | null = null;
    let onChange: (() => void) | null = null;

    void navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled) return;
      statusRef = status;
      onChange = () => {
        if (status.state === "granted") {
          writeLocationConsent("granted");
          return;
        }
        if (status.state === "denied") {
          writeLocationConsent("denied");
          setLocation({
            mode: "manual",
            lat: DEFAULT_CENTER.lat,
            lng: DEFAULT_CENTER.lng,
            label: "Location off — set your area",
          });
          return;
        }
        if (status.state === "prompt" && readLocationConsent() === "granted") {
          clearLocationConsent();
        }
      };
      onChange();
      status.addEventListener("change", onChange);
    });

    return () => {
      cancelled = true;
      if (statusRef && onChange) statusRef.removeEventListener("change", onChange);
    };
  }, []);

  useEffect(() => {
    if (location.mode !== "gps" || !dbConfigured) return;
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh when user opts into GPS
  }, [location.mode, location.lat, location.lng, dbConfigured]);

  const locationPill = useMemo(() => {
    if (locating) {
      return (
        <span className="kf-location-pill">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finding your area…
        </span>
      );
    }
    if (location.mode === "gps") {
      return (
        <span className="kf-location-pill">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {location.label}
        </span>
      );
    }
    if (typeof navigator !== "undefined" && navigator.geolocation) {
      return (
        <button
          type="button"
          className="kf-location-pill kf-location-pill--approx"
          onClick={openLocationPrompt}
        >
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          Near me — accurate distances
        </button>
      );
    }
    return (
      <span className="kf-location-pill">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {location.label}
      </span>
    );
  }, [location, locating, openLocationPrompt]);

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
      {categoryFlashPlaying ? (
        <KfCategoryFlashIntro
          slides={categoryFlashSlides}
          onComplete={dismissCategoryFlash}
        />
      ) : null}
      <KfLocationConsentDialog
        open={locationDialogOpen}
        busy={locating}
        onClose={dismissLocationPrompt}
        onConfirm={confirmLocationFromDialog}
      />
      <div className="kf-home-search-stack">
      <section className="kf-hero kf-animate-in">
        <div className="kf-hero-bg" aria-hidden />
        <p className="kf-hero-kicker">Find local. Support local.</p>
        <h1 className="kf-hero-title mt-2">Your next great local find is closer than you think.</h1>
        <p className="kf-hero-lead">
          Discover trusted local services, skilled artisans and businesses around you.
        </p>
        {locationPill}
      </section>

      {usesApproximateDistance ? (
        <div className="kf-alert-info kf-animate-in" role="status">
          <strong>Distances are approximate</strong> until you share your location. Sorting uses a
          default area — tap <strong>Near me</strong> above for km from where you are.
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
                  void runSearch({ autoExpand: true });
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
                  void runSearch({ autoExpand: true });
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
          void runSearch({ autoExpand: false });
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

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs font-semibold text-[var(--kf-muted)]">
            <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
            Radius
          </span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              className={`kf-chip ${radiusKm === r ? "kf-chip-active" : ""}`}
            >
              {r} km
            </button>
          ))}
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
              Search nearby
            </>
          )}
        </button>
      </form>
      </div>

      {(location.label === "Location off — set your area" || manualOpen) && (
        <div className="kf-card p-4 kf-animate-in">
          <h2 className="text-sm font-bold text-[var(--kf-charcoal)]">Enter location manually</h2>
          <p className="kf-help">Your live GPS is never shown to providers.</p>
          <div className="mt-3 space-y-3">
            <input
              className="kf-input"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              placeholder="Neighbourhood or town"
              aria-label="Area name"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="kf-input"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                inputMode="decimal"
                aria-label="Latitude"
              />
              <input
                className="kf-input"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                inputMode="decimal"
                aria-label="Longitude"
              />
            </div>
            <button
              type="button"
              className="kf-btn kf-btn-outline w-full"
              onClick={() => {
                const lat = Number.parseFloat(manualLat);
                const lng = Number.parseFloat(manualLng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                  setError("Enter valid coordinates.");
                  return;
                }
                setLocation({ mode: "manual", lat, lng, label: manualLabel || "Your area" });
                setError(null);
                void runSearch();
              }}
            >
              Use this location
            </button>
          </div>
        </div>
      )}

      {location.mode === "gps" && !manualOpen && (
        <button
          type="button"
          className="kf-link flex items-center gap-2 text-sm underline-offset-2 hover:underline"
          onClick={() => setManualOpen(true)}
        >
          <Navigation className="h-4 w-4" aria-hidden />
          Enter location manually
        </button>
      )}

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
            <h2 className="kf-section-title">Nearby providers</h2>
            <p className="kf-section-sub mt-0.5">
              {usesApproximateDistance
                ? `Within ${radiusKm} km · approximate order until location is on`
                : `Within ${radiusKm} km · sorted by distance from you`}
            </p>
          </div>
          {searchMeta?.expanded ? (
            <span className="text-xs font-medium text-[var(--kf-terracotta)]">
              Expanded to {searchMeta.radiusKm} km
            </span>
          ) : null}
        </div>

        <div className="mt-4">
          {loading && results.length === 0 ? (
            <ResultSkeletons />
          ) : results.length === 0 ? (
            <KfEmptyState
              icon={<Store className="h-6 w-6" aria-hidden />}
              title="Nobody listed here yet"
              description="KasiFind is still growing in this area. Widen your search, try another category, or help a local trader get listed — it is free."
              action={
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
                  <button
                    type="button"
                    className="kf-btn kf-btn-primary"
                    onClick={() => void runSearch({ autoExpand: true })}
                  >
                    Search wider area
                  </button>
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
                />
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
