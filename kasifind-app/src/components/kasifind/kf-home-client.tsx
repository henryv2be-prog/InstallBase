"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 };
const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

type LocationState =
  | { mode: "pending" }
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

export function KfHomeClient({ dbConfigured }: { dbConfigured: boolean }) {
  const [location, setLocation] = useState<LocationState>({ mode: "pending" });
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

  useEffect(() => {
    if (!dbConfigured) return;
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => {
        if (data.categories) setCategories(data.categories);
      })
      .catch(() => undefined);
  }, [dbConfigured]);

  useEffect(() => {
    if (!dbConfigured) return;
    if (!navigator.geolocation) {
      setLocation({
        mode: "manual",
        lat: DEFAULT_CENTER.lat,
        lng: DEFAULT_CENTER.lng,
        label: "Set your area manually",
      });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          mode: "gps",
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          label: "Near you",
        });
      },
      () => {
        setLocation({
          mode: "manual",
          lat: DEFAULT_CENTER.lat,
          lng: DEFAULT_CENTER.lng,
          label: "Location off — set your area",
        });
      },
      { enableHighAccuracy: false, timeout: 12000, maximumAge: 300_000 }
    );
  }, [dbConfigured]);

  const runSearch = useCallback(
    async (opts?: { autoExpand?: boolean }) => {
      if (!dbConfigured) {
        setError("KasiFind database is not configured on this server.");
        return;
      }
      if (location.mode === "pending") {
        setError("Waiting for location — or enter your area below.");
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
      } catch {
        setError("Network error. Check your connection and try again.");
      } finally {
        setLoading(false);
      }
    },
    [categorySlug, dbConfigured, location, query, radiusKm]
  );

  useEffect(() => {
    if (location.mode === "pending" || !dbConfigured) return;
    void runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load when location resolves
  }, [location.mode, dbConfigured]);

  const locationPill = useMemo(() => {
    if (location.mode === "pending") {
      return (
        <span className="kf-location-pill">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finding your area…
        </span>
      );
    }
    return (
      <span className="kf-location-pill">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        {location.label}
      </span>
    );
  }, [location]);

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
      <section className="kf-hero kf-animate-in">
        <div className="kf-hero-bg" aria-hidden />
        <p className="kf-hero-kicker">Find local. Support local.</p>
        <h1 className="kf-hero-title mt-2">Your next great local find is closer than you think.</h1>
        <p className="kf-hero-lead">
          Discover trusted local services, skilled artisans and businesses around you.
        </p>
        {locationPill}
      </section>

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

      {(location.mode === "manual" || manualOpen) && (
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
              {location.mode !== "pending" ? `Within ${radiusKm} km · sorted by distance` : "…"}
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
              title="No providers in this area yet"
              description="Try another search term, pick a different category, or widen the radius. Know someone who trades locally? They can list for free."
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
