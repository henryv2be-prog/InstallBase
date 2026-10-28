"use client";

import { useEffect, useRef } from "react";
import type { Circle, LeafletMouseEvent, Map as LeafletMap, Marker } from "leaflet";

export type KfLocationMapProps = {
  latitude: number;
  longitude: number;
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
  const onChangeRef = useRef(onLocationChange);
  onChangeRef.current = onLocationChange;

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const leaflet = await import("leaflet");
      await import("leaflet/dist/leaflet.css");
      const L = leaflet.default;
      if (cancelled || !containerRef.current) return;

      const map = L.map(containerRef.current, {
        scrollWheelZoom: interactive,
        dragging: true,
        touchZoom: true,
      }).setView([latitude, longitude], zoomForMode(approximate));

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      if (interactive) {
        map.on("click", (e: LeafletMouseEvent) => {
          onChangeRef.current?.(e.latlng.lat, e.latlng.lng);
        });
      }

      mapRef.current = map;
      requestAnimationFrame(() => map.invalidateSize());
    })();

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
      circleRef.current = null;
    };
    // Mount map once per container.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interactive]);

  useEffect(() => {
    void (async () => {
      const leaflet = await import("leaflet");
      const L = leaflet.default;
      const map = mapRef.current;
      if (!map) return;

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

      const showCircle = approximate && radiusMeters != null && radiusMeters > 0;

      if (showCircle) {
        circleRef.current = L.circle([latitude, longitude], {
          radius: radiusMeters,
          color: "#1a6b4f",
          fillColor: "#1a6b4f",
          fillOpacity: 0.14,
          weight: 2,
        }).addTo(map);
      }

      if (!approximate || interactive) {
        const marker = L.marker([latitude, longitude], {
          icon: pinIcon,
          draggable: interactive,
        }).addTo(map);
        markerRef.current = marker;

        if (interactive) {
          marker.off("dragend");
          marker.on("dragend", () => {
            const pos = marker.getLatLng();
            onChangeRef.current?.(pos.lat, pos.lng);
          });
        }
      }

      map.setView([latitude, longitude], zoomForMode(approximate));
    })();
  }, [latitude, longitude, approximate, radiusMeters, interactive]);

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
