"use client";

import type { AdCreative } from "@/lib/advertising/types";
import { AdCard } from "@/components/ads/ad-card";

interface SponsoredProductProps {
  ad: AdCreative;
  placementKey: string;
}

export function SponsoredProduct({ ad, placementKey }: SponsoredProductProps) {
  return <AdCard ad={{ ...ad, label: "Sponsored" }} placementKey={placementKey} compact />;
}
