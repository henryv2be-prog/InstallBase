"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import type { GeocodeHit } from "@/lib/kasifind/geocode-utils";

type Props = {
  initialQuery?: string;
  onSelect: (place: GeocodeHit) => void;
};

export function KfAreaSearchPicker({ initialQuery = "", onSelect }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<GeocodeHit[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const debounceRef = useRef<number | null>(null);
  const listId = "kf-area-search-results";

  const runSearch = useCallback(async (term: string) => {
    const q = term.trim();
    if (q.length < 2) {
      setResults([]);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      if (!res.ok) {
        setResults([]);
        setError(data.error ?? "Could not search places.");
        return;
      }
      setResults(data.results ?? []);
      setActiveIndex(-1);
      if ((data.results ?? []).length === 0) {
        setError("No places found — try a suburb, township, or city name.");
      }
    } catch {
      setResults([]);
      setError("Network error. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      void runSearch(query);
    }, 420);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const pick = (place: GeocodeHit) => {
    setQuery(place.label);
    setResults([]);
    setError(null);
    onSelect(place);
  };

  return (
    <div className="kf-area-search">
      <label className="sr-only" htmlFor="kf-area-search-input">
        Search for your area
      </label>
      <div className="kf-search-shell">
        <Search className="h-5 w-5 shrink-0 text-[var(--kf-forest)]" aria-hidden />
        <input
          id="kf-area-search-input"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. Roodepoort, Soweto, Durban…"
          className="kf-search-input"
          autoComplete="off"
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-controls={results.length > 0 ? listId : undefined}
          aria-expanded={results.length > 0}
          onKeyDown={(e) => {
            if (results.length === 0) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(results.length - 1, i + 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(0, i - 1));
            } else if (e.key === "Enter" && activeIndex >= 0) {
              e.preventDefault();
              const place = results[activeIndex];
              if (place) pick(place);
            }
          }}
        />
        {loading ? <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--kf-muted)]" aria-hidden /> : null}
      </div>

      {error ? <p className="kf-help mt-2 text-[var(--kf-terracotta)]">{error}</p> : null}

      {results.length > 0 ? (
        <ul id={listId} className="kf-area-search-results mt-2" role="listbox">
          {results.map((place, i) => (
            <li key={place.placeId} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={i === activeIndex}
                className={`kf-area-search-option${i === activeIndex ? " kf-area-search-option-active" : ""}`}
                onClick={() => pick(place)}
              >
                <MapPin className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
                <span className="min-w-0 text-left">{place.label}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
