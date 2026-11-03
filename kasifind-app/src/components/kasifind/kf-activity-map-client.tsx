"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, MapPin, X } from "lucide-react";
import type { Circle, CircleMarker, LatLngBounds, Map as LeafletMap, TileLayer } from "leaflet";
import { SA_MAP_DEFAULT_VIEW } from "@/lib/kasifind/geo";
import { KfProviderCard } from "@/components/kasifind/kf-provider-card";
import { useListingContactCtaLabels } from "@/components/kasifind/use-listing-contact-cta-labels";
import type { KfSearchResult } from "@/components/kasifind/types";

type ActivityCell = {
  id: string;
  centerLat: number;
  centerLng: number;
  count: number;
  areaHint: string;
};

type CellsPayload = {
  cells: ActivityCell[];
  gridStep: number;
  searchRadiusKm: number;
  totalPublished: number;
};

function heatColor(count: number, maxCount: number): string {
  if (maxCount <= 0 || count <= 0) return "rgba(149, 213, 178, 0.35)";
  const t = Math.min(1, count / maxCount);
  const r = Math.round(15 + t * (255 - 15));
  const g = Math.round(77 + t * (138 - 77));
  const b = Math.round(58 + t * (0 - 58));
  const a = 0.35 + t * 0.5;
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

function heatStroke(count: number, maxCount: number): string {
  if (maxCount <= 0) return "rgba(15, 77, 58, 0.35)";
  const t = Math.min(1, count / maxCount);
  return t > 0.65 ? "rgba(255, 138, 0, 0.85)" : "rgba(15, 77, 58, 0.55)";
}

function countHotspotsInView(cells: ActivityCell[], bounds: LatLngBounds): number {
  return cells.filter((cell) => bounds.contains([cell.centerLat, cell.centerLng])).length;
}

export function KfActivityMapClient({ initialTotal }: { initialTotal: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const tilesRef = useRef<TileLayer | null>(null);
  const heatLayersRef = useRef<Circle[]>([]);
  const userMarkerRef = useRef<CircleMarker | null>(null);
  const hasAutoFramedRef = useRef(false);
  const suppressMoveFetchRef = useRef(false);
  const fetchTimerRef = useRef<number | null>(null);
  const cellsPayloadRef = useRef<CellsPayload | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [loadingCells, setLoadingCells] = useState(false);
  const [cellsPayload, setCellsPayload] = useState<CellsPayload | null>(null);
  const [selected, setSelected] = useState<ActivityCell | null>(null);
  const [exploreLoading, setExploreLoading] = useState(false);
  const [exploreResults, setExploreResults] = useState<KfSearchResult[]>([]);
  const [exploreError, setExploreError] = useState<string | null>(null);
  const [totalPublished, setTotalPublished] = useState(initialTotal);
  const [noHotspotsInView, setNoHotspotsInView] = useState(false);
  const [cellsFetchError, setCellsFetchError] = useState<string | null>(null);
  const [hotspotsInView, setHotspotsInView] = useState(0);
  const [noMappableCells, setNoMappableCells] = useState(false);

  const exploreListingIds = useMemo(() => exploreResults.map((r) => r.id), [exploreResults]);
  const exploreContactScopeKey = useMemo(() => {
    if (exploreListingIds.length === 0) return null;
    const cellPart = selected?.id ?? "none";
    return `${cellPart}|${exploreListingIds.join(",")}`;
  }, [exploreListingIds, selected?.id]);
  const exploreContactCtaLabels = useListingContactCtaLabels(
    exploreListingIds,
    exploreContactScopeKey
  );

  const clearHeatLayers = useCallback(() => {
    for (const layer of heatLayersRef.current) {
      layer.remove();
    }
    heatLayersRef.current = [];
  }, []);

  const paintHeatLayers = useCallback(
    async (payload: CellsPayload) => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      const map = mapRef.current;
      if (!map) return;

      clearHeatLayers();
      const cells = payload.cells;
      if (cells.length === 0) return;

      const maxCount = Math.max(1, ...cells.map((c) => c.count));
      const zoom = map.getZoom();
      const radiusM = Math.max(
        2400,
        payload.gridStep * 111_000 * (zoom >= 11 ? 0.62 : 0.52)
      );

      for (const cell of cells) {
        const circle = L.circle([cell.centerLat, cell.centerLng], {
          radius: radiusM,
          color: heatStroke(cell.count, maxCount),
          weight: cell.count > maxCount * 0.5 ? 2.5 : 1.5,
          fillColor: heatColor(cell.count, maxCount),
          fillOpacity: 1,
          interactive: true,
        }).addTo(map);

        circle.on("click", () => {
          setSelected(cell);
          setExploreResults([]);
          setExploreError(null);
        });

        circle.bringToFront();
        heatLayersRef.current.push(circle);
      }

      userMarkerRef.current?.bringToFront();
    },
    [clearHeatLayers]
  );

  const updateViewMeta = useCallback((payload: CellsPayload) => {
    const map = mapRef.current;
    if (!map) return;
    const bounds = map.getBounds();
    const inView = countHotspotsInView(payload.cells, bounds);
    setHotspotsInView(inView);
    setNoHotspotsInView((payload.totalPublished ?? 0) > 0 && inView === 0);
  }, []);

  const fetchCells = useCallback(async () => {
    const map = mapRef.current;
    if (!map) return;
    if (suppressMoveFetchRef.current) return;

    const bounds = map.getBounds();
    const zoom = map.getZoom();
    setLoadingCells(true);
    setCellsFetchError(null);
    try {
      const params = new URLSearchParams({
        zoom: String(zoom),
        north: String(bounds.getNorth()),
        south: String(bounds.getSouth()),
        east: String(bounds.getEast()),
        west: String(bounds.getWest()),
      });
      const res = await fetch(`/api/activity-map/cells?${params}`);
      const data = (await res.json()) as CellsPayload & { error?: string };
      if (!res.ok) {
        setCellsFetchError(data.error ?? "Could not load listing hotspots.");
        return;
      }

      const payload: CellsPayload = {
        cells: data.cells ?? [],
        gridStep: data.gridStep,
        searchRadiusKm: data.searchRadiusKm,
        totalPublished: data.totalPublished ?? initialTotal,
      };

      cellsPayloadRef.current = payload;
      setCellsPayload(payload);
      if (typeof data.totalPublished === "number") setTotalPublished(data.totalPublished);

      setNoMappableCells(payload.totalPublished > 0 && payload.cells.length === 0);
      await paintHeatLayers(payload);
      updateViewMeta(payload);

      if (
        !hasAutoFramedRef.current &&
        payload.totalPublished > 0 &&
        payload.cells.length > 0
      ) {
        hasAutoFramedRef.current = true;
        suppressMoveFetchRef.current = true;
        const latLngs = payload.cells.map((c) => [c.centerLat, c.centerLng] as [number, number]);
        map.fitBounds(latLngs, { padding: [40, 40], maxZoom: 12 });
        map.once("moveend", () => {
          suppressMoveFetchRef.current = false;
          const latest = cellsPayloadRef.current;
          if (latest) {
            void paintHeatLayers(latest);
            updateViewMeta(latest);
          }
        });
      }
    } catch {
      setCellsFetchError("Network error loading listing hotspots.");
    } finally {
      setLoadingCells(false);
    }
  }, [initialTotal, paintHeatLayers, updateViewMeta]);

  const scheduleFetchCells = useCallback(() => {
    if (suppressMoveFetchRef.current) return;
    if (fetchTimerRef.current) window.clearTimeout(fetchTimerRef.current);
    fetchTimerRef.current = window.setTimeout(() => {
      void fetchCells();
    }, 280);
  }, [fetchCells]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const L = leaflet.default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        center: [SA_MAP_DEFAULT_VIEW.latitude, SA_MAP_DEFAULT_VIEW.longitude],
        zoom: SA_MAP_DEFAULT_VIEW.zoom,
        minZoom: 5,
        maxZoom: 13,
        preferCanvas: true,
        maxBounds: [
          [-35.5, 16],
          [-22, 33.5],
        ],
        maxBoundsViscosity: 0.85,
      });

      tilesRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
      map.on("moveend", scheduleFetchCells);
      map.on("zoomend", scheduleFetchCells);
      requestAnimationFrame(() => map.invalidateSize());
      window.setTimeout(() => map.invalidateSize(), 200);
      window.setTimeout(() => map.invalidateSize(), 600);
    })();

    return () => {
      cancelled = true;
      if (fetchTimerRef.current) window.clearTimeout(fetchTimerRef.current);
      mapRef.current?.off("moveend", scheduleFetchCells);
      mapRef.current?.off("zoomend", scheduleFetchCells);
      clearHeatLayers();
      userMarkerRef.current?.remove();
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [clearHeatLayers, scheduleFetchCells]);

  useEffect(() => {
    if (!mapReady) return;
    window.setTimeout(() => {
      void fetchCells();
    }, 350);
  }, [mapReady, fetchCells]);

  useEffect(() => {
    if (!mapReady) return;
    if (typeof navigator === "undefined" || !navigator.permissions?.query) return;

    let cancelled = false;
    void navigator.permissions.query({ name: "geolocation" }).then((status) => {
      if (cancelled || status.state !== "granted") return;
      if (!navigator.geolocation) return;
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (cancelled || !mapRef.current) return;
          void import("leaflet").then((leaflet) => {
            const L = leaflet.default;
            userMarkerRef.current?.remove();
            userMarkerRef.current = L.circleMarker([pos.coords.latitude, pos.coords.longitude], {
              radius: 7,
              color: "#1d4ed8",
              weight: 2,
              fillColor: "#3b82f6",
              fillOpacity: 0.95,
            }).addTo(mapRef.current!);
            userMarkerRef.current.bringToFront();
          });
        },
        () => undefined,
        { maximumAge: 600_000, timeout: 8000 }
      );
    });

    return () => {
      cancelled = true;
    };
  }, [mapReady]);

  const exploreSelectedArea = async () => {
    if (!selected || !cellsPayload) return;
    setExploreLoading(true);
    setExploreError(null);
    try {
      const params = new URLSearchParams({
        lat: String(selected.centerLat),
        lng: String(selected.centerLng),
        radiusKm: String(cellsPayload.searchRadiusKm),
        autoExpand: "1",
      });
      const res = await fetch(`/api/search?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setExploreError(data.error ?? "Could not load listings.");
        setExploreResults([]);
        return;
      }
      setExploreResults(data.results ?? []);
    } catch {
      setExploreError("Network error loading listings.");
      setExploreResults([]);
    } finally {
      setExploreLoading(false);
    }
  };

  return (
    <div className="kf-activity-map-page">
      <header className="kf-activity-map-head kf-animate-in">
        <div>
          <p className="kf-activity-map-kicker">Listing coverage</p>
          <h1 className="kf-activity-map-title">KasiFind Activity Map</h1>
          <p className="kf-activity-map-lead">
            See where published businesses are listed across South Africa. Hotspots show{" "}
            <strong>listing density</strong>, not live foot traffic.
          </p>
        </div>
        <div className="kf-activity-map-stats" aria-live="polite">
          <p className="kf-activity-map-stat-label">Published listings</p>
          <p className="kf-activity-map-stat-value">{totalPublished.toLocaleString("en-ZA")}</p>
          {loadingCells ? (
            <p className="kf-activity-map-stat-hint">
              <Loader2 className="inline h-3 w-3 animate-spin" aria-hidden /> Updating map…
            </p>
          ) : cellsFetchError ? (
            <p className="kf-activity-map-stat-hint text-[var(--kf-terracotta)]">{cellsFetchError}</p>
          ) : noMappableCells ? (
            <p className="kf-activity-map-stat-hint text-[var(--kf-terracotta)]">
              Listings exist but no valid map pins — check coordinates on each listing.
            </p>
          ) : hotspotsInView > 0 ? (
            <p className="kf-activity-map-stat-hint">
              {hotspotsInView} hotspot{hotspotsInView === 1 ? "" : "s"} in this view · tap to explore
            </p>
          ) : (
            <p className="kf-activity-map-stat-hint">Tap a hotspot to explore an area</p>
          )}
        </div>
      </header>

      <div className="kf-activity-map-legend">
        <span className="kf-activity-map-legend-label">Fewer listings</span>
        <span className="kf-activity-map-legend-gradient" aria-hidden />
        <span className="kf-activity-map-legend-label">More listings</span>
        <span className="kf-activity-map-legend-you" aria-hidden>
          <span className="kf-activity-map-legend-dot" /> Your location
        </span>
      </div>

      {cellsFetchError ? <div className="kf-alert-error mx-4 text-sm">{cellsFetchError}</div> : null}

      <div className="kf-activity-map-shell">
        <div ref={containerRef} className="kf-activity-map-canvas" role="application" aria-label="South Africa listing density map" />
        {noHotspotsInView ? (
          <p className="kf-activity-map-empty-view" role="status">
            No listing hotspots in this view — the map uses each business&apos;s map pin (not the
            suburb name). Pinch out or pan to the coloured zones, or check pins in My listing /
            admin if you expected coverage here.
          </p>
        ) : null}
      </div>

      {selected ? (
        <aside className="kf-activity-map-panel kf-animate-in" aria-label="Selected area">
          <div className="kf-activity-map-panel-head">
            <div className="min-w-0">
              <p className="kf-activity-map-panel-kicker">Selected area</p>
              <p className="kf-activity-map-panel-title">{selected.areaHint}</p>
              <p className="kf-activity-map-panel-meta">
                <MapPin className="inline h-3.5 w-3.5" aria-hidden />{" "}
                {selected.count} published listing{selected.count === 1 ? "" : "s"} in this zone
              </p>
            </div>
            <button
              type="button"
              className="kf-btn kf-btn-ghost shrink-0 px-2"
              aria-label="Close area panel"
              onClick={() => {
                setSelected(null);
                setExploreResults([]);
                setExploreError(null);
              }}
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="kf-activity-map-panel-actions">
            <button
              type="button"
              className="kf-btn kf-btn-primary flex-1"
              disabled={exploreLoading}
              onClick={() => void exploreSelectedArea()}
            >
              {exploreLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  Loading listings…
                </>
              ) : (
                "Explore listings here"
              )}
            </button>
            <Link href="/" className="kf-btn kf-btn-outline flex-1">
              Back to search
            </Link>
          </div>

          {exploreError ? <p className="kf-alert-error text-sm">{exploreError}</p> : null}

          {exploreResults.length > 0 ? (
            <ul className="mt-3 grid gap-3">
              {exploreResults.map((p, i) => (
                <KfProviderCard
                  key={p.id}
                  provider={p}
                  serviceHint={p.services[0]?.name ?? ""}
                  index={i}
                  impressionScopeKey={exploreContactScopeKey}
                  contactCtaLabel={exploreContactCtaLabels.get(p.id)}
                />
              ))}
            </ul>
          ) : null}

          {!exploreLoading && exploreResults.length === 0 && !exploreError ? (
            <p className="text-sm text-[var(--kf-muted)]">
              Tap explore to load providers in this area using the same search as the homepage.
            </p>
          ) : null}
        </aside>
      ) : null}
    </div>
  );
}
