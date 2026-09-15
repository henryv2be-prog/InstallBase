"use client";

import type { AdCreative } from "@/lib/advertising/types";
import { BannerAd } from "@/components/ads/banner-ad";
import { SponsoredPost } from "@/components/ads/sponsored-post";
import { SponsoredProduct } from "@/components/ads/sponsored-product";
import { SponsoredContent } from "@/components/ads/sponsored-content";
import { AdCard } from "@/components/ads/ad-card";

interface AdRendererProps {
  ad: AdCreative;
  placementKey: string;
}

export function AdRenderer({ ad, placementKey }: AdRendererProps) {
  switch (ad.type) {
    case "BANNER":
      return <BannerAd ad={ad} placementKey={placementKey} />;
    case "SPONSORED_POST":
      return <SponsoredPost ad={ad} placementKey={placementKey} />;
    case "SPONSORED_PRODUCT":
      return <SponsoredProduct ad={ad} placementKey={placementKey} />;
    case "SPONSORED_ARTICLE":
      return <SponsoredContent ad={ad} placementKey={placementKey} />;
    case "VIDEO":
    case "IMAGE":
    default:
      return <AdCard ad={ad} placementKey={placementKey} />;
  }
}
