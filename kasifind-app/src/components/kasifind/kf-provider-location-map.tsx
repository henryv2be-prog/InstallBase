"use client";

import { ExternalLink, MapPin } from "lucide-react";
import { KfLocationMap } from "@/components/kasifind/kf-location-map";
import type { PublicMapLocation } from "@/lib/kasifind/location-display";

export function KfProviderLocationMap({
  locationLabel,
  map,
}: {
  locationLabel: string;
  map: PublicMapLocation;
}) {
  const osmUrl = `https://www.openstreetmap.org/?mlat=${map.latitude}&mlon=${map.longitude}#map=${map.approximate ? 13 : 16}/${map.latitude}/${map.longitude}`;

  return (
    <section className="kf-card mt-8 overflow-hidden kf-animate-in">
      <div className="border-b border-[var(--kf-border)] px-6 py-4">
        <h2 className="kf-section-title">Location</h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm text-[var(--kf-muted)]">
          <MapPin className="h-4 w-4 shrink-0" aria-hidden />
          {locationLabel}
        </p>
        <p className="mt-1 text-xs text-[var(--kf-muted-soft)]">
          {map.approximate
            ? "Approximate service area — exact address is not shown."
            : "Exact location on map."}
        </p>
      </div>
      <KfLocationMap
        latitude={map.latitude}
        longitude={map.longitude}
        approximate={map.approximate}
        radiusMeters={map.radiusMeters}
        interactive={false}
        className="rounded-none border-0 shadow-none"
      />
      <div className="border-t border-[var(--kf-border)] px-6 py-3">
        <a
          href={osmUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--kf-green)]"
        >
          Open in OpenStreetMap
          <ExternalLink className="h-3.5 w-3.5" aria-hidden />
        </a>
      </div>
    </section>
  );
}
