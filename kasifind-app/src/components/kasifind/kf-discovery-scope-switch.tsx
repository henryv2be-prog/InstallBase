"use client";

import { Globe2, Loader2, LocateFixed, MapPin } from "lucide-react";

export type DiscoverySearchScope = "near" | "nationwide" | "area";

type Props = {
  scope: DiscoverySearchScope;
  locating?: boolean;
  areaHint?: string | null;
  onSelect: (scope: DiscoverySearchScope) => void;
};

const SEGMENTS: {
  id: DiscoverySearchScope;
  label: string;
  shortLabel: string;
  icon: typeof LocateFixed;
}[] = [
  { id: "near", label: "Near me", shortLabel: "Near me", icon: LocateFixed },
  { id: "nationwide", label: "Nationwide", shortLabel: "Nationwide", icon: Globe2 },
  { id: "area", label: "Set location", shortLabel: "Set area", icon: MapPin },
];

export function KfDiscoveryScopeSwitch({
  scope,
  locating = false,
  areaHint,
  onSelect,
}: Props) {
  return (
    <div className="kf-scope-switch-wrap">
      <div className="kf-scope-switch" role="group" aria-label="Where to search">
        {SEGMENTS.map((seg) => {
          const active = scope === seg.id;
          const Icon = seg.icon;
          return (
            <button
              key={seg.id}
              type="button"
              className={`kf-scope-switch-seg${active ? " kf-scope-switch-seg--active" : ""}`}
              aria-pressed={active}
              aria-busy={seg.id === "near" && locating ? true : undefined}
              onClick={() => onSelect(seg.id)}
            >
              {seg.id === "near" && locating ? (
                <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin" aria-hidden />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
              )}
              <span className="kf-scope-switch-seg-text">{seg.shortLabel}</span>
            </button>
          );
        })}
      </div>
      {scope === "area" && areaHint ? (
        <p className="kf-scope-switch-hint">
          <MapPin className="inline h-3 w-3" aria-hidden /> Searching in <strong>{areaHint}</strong>
        </p>
      ) : null}
      {scope === "near" && !locating ? (
        <p className="kf-scope-switch-hint kf-scope-switch-hint--muted">
          Sorted by distance from your device. GPS is not shown on listings.
        </p>
      ) : null}
    </div>
  );
}