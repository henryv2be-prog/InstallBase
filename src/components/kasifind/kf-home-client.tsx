"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Search, Loader2, Navigation } from "lucide-react";
import type { KfCategory, KfSearchResult } from "@/components/kasifind/types";
import { formatDistanceKmClient } from "@/components/kasifind/format-distance";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";

const DEFAULT_CENTER = { lat: -26.2041, lng: 28.0473 }; // Johannesburg fallback for manual mode
const RADIUS_OPTIONS = [5, 10, 25, 50] as const;

type LocationState =
  | { mode: "pending" }
  | { mode: "gps"; lat: number; lng: number; label: string }
  | { mode: "manual"; lat: number; lng: number; label: string };

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
  const [manualLat, setManualLat] = useState(String(DEFAULT_CENTER.lat));
  const [manualLng, setManualLng] = useState(String(DEFAULT_CENTER.lng));
  const [manualLabel, setManualLabel] = useState("Johannesburg area");

  useEffect(() => {
    if (!dbConfigured) return;
    fetch("/api/kasifind/categories")
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
          label: "Using your location",
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
        const res = await fetch(`/api/kasifind/search?${params}`);
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
  }, [location.mode, dbConfigured]); // initial nearby browse

  const locationBanner = useMemo(() => {
    if (location.mode === "pending") {
      return (
        <p className="flex items-center gap-2 text-sm text-[var(--kf-muted)]">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Detecting your location…
        </p>
      );
    }
    return (
      <p className="flex items-center gap-2 text-sm text-[var(--kf-green-dark)]">
        <MapPin className="h-4 w-4 shrink-0" aria-hidden />
        <span>{location.label}</span>
      </p>
    );
  }, [location]);

  if (!dbConfigured) {
    return (
      <div className="kf-card rounded-2xl p-6">
        <h1 className="text-2xl font-bold text-[var(--kf-green-dark)]">KasiFind</h1>
        <p className="mt-2 text-[var(--kf-muted)]">
          This environment has not been wired to a KasiFind database yet. Set{" "}
          <code className="text-sm">KASIFIND_DATABASE_URL</code>, run migrations, and seed
          categories to enable search.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--kf-ink)] sm:text-3xl">
          Find trusted locals near you
        </h1>
        <p className="mt-2 text-[var(--kf-muted)]">
          Search for welders, mechanics, plumbers, hairdressers and more — sorted by distance.
        </p>
        {locationBanner}
      </section>

      <form
        className="kf-card space-y-3 rounded-2xl p-4"
        onSubmit={(e) => {
          e.preventDefault();
          void runSearch({ autoExpand: false });
        }}
      >
        <label className="block">
          <span className="sr-only">Search for a service</span>
          <div className="flex items-center gap-2 rounded-xl border-2 border-[var(--kf-green)] bg-white px-3 py-2">
            <Search className="h-5 w-5 text-[var(--kf-green)]" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. steel gates, plumber, car mechanic"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-gray-400"
              autoComplete="off"
            />
          </div>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-[var(--kf-muted)]">
            Radius
          </span>
          {RADIUS_OPTIONS.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRadiusKm(r)}
              className={`rounded-full px-3 py-1 text-sm font-medium ${
                radiusKm === r ? "kf-btn-primary" : "border border-black/15 bg-white"
              }`}
            >
              {r} km
            </button>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="kf-btn-primary flex w-full items-center justify-center gap-2 rounded-xl py-3 text-base"
        >
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5" />}
          Search nearby
        </button>
      </form>

      {location.mode === "manual" && (
        <details className="kf-card rounded-2xl p-4">
          <summary className="cursor-pointer font-semibold text-[var(--kf-green-dark)]">
            Enter location manually
          </summary>
          <div className="mt-3 space-y-2">
            <input
              className="w-full rounded-lg border px-3 py-2"
              value={manualLabel}
              onChange={(e) => setManualLabel(e.target.value)}
              placeholder="Neighbourhood or town"
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-lg border px-3 py-2"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                inputMode="decimal"
                aria-label="Latitude"
              />
              <input
                className="rounded-lg border px-3 py-2"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                inputMode="decimal"
                aria-label="Longitude"
              />
            </div>
            <button
              type="button"
              className="kf-btn-outline w-full rounded-xl py-2"
              onClick={() => {
                const lat = Number.parseFloat(manualLat);
                const lng = Number.parseFloat(manualLng);
                if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
                  setError("Enter valid coordinates.");
                  return;
                }
                setLocation({ mode: "manual", lat, lng, label: manualLabel || "Your area" });
                setError(null);
              }}
            >
              Use this location
            </button>
            <p className="text-xs text-[var(--kf-muted)]">
              Tip: drop a pin in Google Maps, copy coordinates, and paste them here. Your live GPS
              is never shown to providers.
            </p>
          </div>
        </details>
      )}

      {location.mode === "gps" && (
        <button
          type="button"
          className="flex items-center gap-2 text-sm font-medium text-[var(--kf-green-dark)] underline"
          onClick={() =>
            setLocation({
              mode: "manual",
              lat: DEFAULT_CENTER.lat,
              lng: DEFAULT_CENTER.lng,
              label: "Manual location",
            })
          }
        >
          <Navigation className="h-4 w-4" aria-hidden />
          Enter location manually instead
        </button>
      )}

      {categories.length > 0 && (
        <section>
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-[var(--kf-muted)]">
            Browse categories
          </h2>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                setCategorySlug(null);
                void runSearch();
              }}
              className={`kf-chip rounded-full px-3 py-1.5 ${!categorySlug ? "ring-2 ring-[var(--kf-green)]" : ""}`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategorySlug(c.slug);
                  void runSearch();
                }}
                className={`kf-chip rounded-full px-3 py-1.5 ${categorySlug === c.slug ? "ring-2 ring-[var(--kf-green)]" : ""}`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </section>
      )}

      {error && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <div className="flex items-baseline justify-between gap-2">
          <h2 className="text-lg font-bold">Nearby providers</h2>
          {searchMeta?.expanded && (
            <span className="text-xs text-[var(--kf-muted)]">
              Expanded to {searchMeta.radiusKm} km
            </span>
          )}
        </div>

        {loading && results.length === 0 ? (
          <p className="text-[var(--kf-muted)]">Searching…</p>
        ) : results.length === 0 ? (
          <div className="kf-card rounded-2xl p-5 text-center">
            <p className="font-medium">No providers found in this area yet.</p>
            <p className="mt-1 text-sm text-[var(--kf-muted)]">
              Try a different search, pick another category, or widen the radius.
            </p>
            <button
              type="button"
              className="kf-btn-outline mt-4 rounded-xl px-4 py-2"
              onClick={() => void runSearch({ autoExpand: true })}
            >
              Search wider area
            </button>
          </div>
        ) : (
          <ul className="space-y-3">
            {results.map((p) => {
              const waPhone = p.whatsapp || p.phone;
              const serviceHint = p.services[0]?.name ?? query;
              const waUrl = buildWhatsAppUrl(waPhone, defaultEnquiryMessage(p.displayName, serviceHint));
              const thumb = p.photoUrls[0] ?? p.profileImageUrl;
              return (
                <li key={p.id} className="kf-card overflow-hidden rounded-2xl">
                  <Link href={`/kasifind/provider/${p.id}`} className="block p-4">
                    <div className="flex gap-3">
                      <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-[var(--kf-sand)]">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-xs text-[var(--kf-muted)]">
                            Photo
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate font-bold text-[var(--kf-green-dark)]">
                          {p.displayName}
                        </h3>
                        <p className="text-sm font-medium text-[var(--kf-gold)]">
                          {formatDistanceKmClient(p.distanceKm)}
                        </p>
                        <p className="text-xs text-[var(--kf-muted)]">{p.locationLabel}</p>
                        {p.reviewCount > 0 && p.averageRating !== null ? (
                          <p className="mt-1 text-xs">
                            ★ {p.averageRating.toFixed(1)} ({p.reviewCount} unverified reviews)
                          </p>
                        ) : null}
                        <p className="mt-1 line-clamp-2 text-sm text-[var(--kf-muted)]">
                          {p.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                  <div className="flex border-t border-black/5">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="kf-btn-primary flex-1 py-3 text-center text-sm"
                    >
                      WhatsApp
                    </a>
                    <a
                      href={`tel:${p.phone.replace(/\s/g, "")}`}
                      className="flex-1 py-3 text-center text-sm font-semibold text-[var(--kf-green-dark)]"
                    >
                      Call
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
