"use client";

import type { AdCreative } from "@/lib/advertising/types";
import { AdCard } from "@/components/ads/ad-card";
import { SponsoredPost } from "@/components/ads/sponsored-post";
import { SponsoredProduct } from "@/components/ads/sponsored-product";
import { SponsoredContent } from "@/components/ads/sponsored-content";

interface ImmersiveAdRendererProps {
  ad: AdCreative;
  placementKey: string;
}

/** Full-slide sponsored unit — never the horizontal feed-top banner layout. */
export function ImmersiveAdRenderer({ ad, placementKey }: ImmersiveAdRendererProps) {
  switch (ad.type) {
    case "SPONSORED_POST":
      return <SponsoredPost ad={ad} placementKey={placementKey} />;
    case "SPONSORED_PRODUCT":
      return <SponsoredProduct ad={ad} placementKey={placementKey} />;
    case "SPONSORED_ARTICLE":
      return <SponsoredContent ad={ad} placementKey={placementKey} />;
    case "BANNER":
    case "VIDEO":
    case "IMAGE":
    default:
      return <AdCard ad={ad} placementKey={placementKey} />;
  }
}
