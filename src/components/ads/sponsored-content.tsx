"use client";

import type { AdCreative } from "@/lib/advertising/types";
import { AdCard } from "@/components/ads/ad-card";

interface SponsoredContentProps {
  ad: AdCreative;
  placementKey: string;
}

export function SponsoredContent({ ad, placementKey }: SponsoredContentProps) {
  return <AdCard ad={ad} placementKey={placementKey} />;
}
