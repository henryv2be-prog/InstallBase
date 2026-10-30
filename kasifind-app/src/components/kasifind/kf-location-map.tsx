"use client";

import { useEffect, useRef, useState } from "react";
import type { Circle, LeafletMouseEvent, Map as LeafletMap, Marker, TileLayer } from "leaflet";
import { SA_MAP_DEFAULT_VIEW } from "@/lib/kasifind/geo";

export type KfLocationMapProps = {
  latitude: number;
  longitude: number;
  /** When false, show country overview until the provider taps the map or uses GPS. */
  pinPlaced?: boolean;
  approximate: boolean;
  radiusMeters?: number | null;
  /** Allow drag / tap to move the pin (listing editor). */
  interactive?: boolean;
  onLocationChange?: (lat: number, lng: number) => void;
  className?: string;
};

function zoomForMode(approximate: boolean) {
  return approximate ? 13 : 15;
}

export function KfLocationMap({
  latitude,
  longitude,
  pinPlaced = true,
  approximate,
  radiusMeters = null,
  interactive = false,
  onLocationChange,
  className = "",
}: KfLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<LeafletMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const circleRef = useRef<Circle | null>(null);
  const tilesRef = useRef<TileLayer | null>(null);
  const onChangeRef = useRef(onLocationChange);
  const [mapReady, setMapReady] = useState(false);
  onChangeRef.current = onLocationChange;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const L = leaflet.default;
      if (cancelled || !containerRef.current || mapRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: interactive,
        dragging: true,
        touchZoom: true,
      });

      tilesRef.current = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;
      if (!cancelled) setMapReady(true);

      requestAnimationFrame(() => map.invalidateSize());
      window.setTimeout(() => map.invalidateSize(), 200);
    })();

    return () => {
      cancelled = true;
      setMapReady(false);
      mapRef.current?.remove();
      mapRef.current = null;
      tilesRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
  }, [interactive]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map) return;

    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;

      circleRef.current?.remove();
      markerRef.current?.remove();
      circleRef.current = null;
      markerRef.current = null;

      const pinIcon = L.divIcon({
        className: "kf-map-pin-wrap",
        html: '<span class="kf-map-pin-marker" aria-hidden="true"></span>',
        iconSize: [28, 28],
        iconAnchor: [14, 28],
      });

      const showCircle =
        pinPlaced && approximate && radiusMeters != null && radiusMeters > 0;
      const showPin = pinPlaced && (!approximate || interactive);

      if (showCircle) {
        circleRef.current = L.circle([latitude, longitude], {
          radius: radiusMeters,
          color: "#1a6b4f",
          fillColor: "#1a6b4f",
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(map);
      }

      if (showPin) {
        const marker = L.marker([latitude, longitude], {
          icon: pinIcon,
          draggable: interactive,
          zIndexOffset: 1000,
        }).addTo(map);
        markerRef.current = marker;

        if (interactive) {
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChangeRef.current?.(pos.lat, pos.lng);
          });
        }
      }

      if (pinPlaced) {
        map.setView([latitude, longitude], zoomForMode(approximate));
      } else {
        map.setView(
          [SA_MAP_DEFAULT_VIEW.latitude, SA_MAP_DEFAULT_VIEW.longitude],
          SA_MAP_DEFAULT_VIEW.zoom
        );
      }
      map.invalidateSize();
    })();
  }, [mapReady, latitude, longitude, pinPlaced, approximate, radiusMeters, interactive]);

  useEffect(() => {
    if (!mapReady) return;
    const map = mapRef.current;
    if (!map || !interactive) return;

    const onClick = (e: LeafletMouseEvent) => {
      onChangeRef.current?.(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", onClick);
    return () => {
      map.off("click", onClick);
    };
  }, [mapReady, interactive]);

  return (
    <div
      className={`kf-location-map ${className}`.trim()}
      aria-label={
        approximate
          ? "Map showing approximate service area"
          : "Map showing provider location"
      }
    >
      <div ref={containerRef} className="kf-location-map-canvas" />
    </div>
  );
}
