"use client";

import type { AdCreative } from "@/lib/advertising/types";
import { AdCard } from "@/components/ads/ad-card";

interface SponsoredPostProps {
  ad: AdCreative;
  placementKey: string;
}

export function SponsoredPost({ ad, placementKey }: SponsoredPostProps) {
  return <AdCard ad={{ ...ad, label: "Sponsored" }} placementKey={placementKey} />;
}
