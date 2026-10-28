"use client";

import { MapPin } from "lucide-react";
import { KfLocationMap } from "@/components/kasifind/kf-location-map";
import type { PublicMapLocation } from "@/lib/kasifind/location-display";

export function KfProviderLocationMap({
  locationLabel,
  map,
}: {
  locationLabel: string;
  map: PublicMapLocation;
}) {
  return (
    <section className="kf-card mt-8 overflow-hidden kf-animate-in">
      <div className="px-6 py-4">
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
    </section>
  );
}
