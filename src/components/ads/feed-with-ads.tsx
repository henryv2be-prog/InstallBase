"use client";

import type { ReactNode } from "react";
import type { AdCreative } from "@/lib/advertising/types";
import { AdRenderer } from "@/components/ads/ad-renderer";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";

interface FeedWithAdsProps {
  children: ReactNode[];
  betweenAds: AdCreative[];
  minPostsBetweenAds: number;
  placementKey?: string;
}

export function FeedWithAds({
  children,
  betweenAds,
  minPostsBetweenAds,
  placementKey = AD_PLACEMENTS.FEED_BETWEEN_POSTS,
}: FeedWithAdsProps) {
  if (children.length === 0) return null;

  const items: ReactNode[] = [];
  let adIndex = 0;

  children.forEach((child, index) => {
    items.push(child);
    const shouldInsertAd =
      betweenAds.length > 0 &&
      adIndex < betweenAds.length &&
      index > 0 &&
      (index + 1) % (minPostsBetweenAds + 1) === 0;

    if (shouldInsertAd) {
      const ad = betweenAds[adIndex];
      adIndex += 1;
      items.push(
        <AdRenderer key={`ad-${ad.id}-${index}`} ad={ad} placementKey={placementKey} />
      );
    }
  });

  return <div className="space-y-4">{items}</div>;
}
