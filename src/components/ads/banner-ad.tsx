"use client";

import Link from "next/link";
import type { AdCreative } from "@/lib/advertising/types";
import { AdImpressionTracker, trackAdClick } from "@/components/ads/ad-tracker";
import { cn } from "@/lib/utils";

interface BannerAdProps {
  ad: AdCreative;
  placementKey: string;
  className?: string;
}

export function BannerAd({ ad, placementKey, className }: BannerAdProps) {
  const href = ad.destinationUrl;
  const external = !ad.isInternalLink;

  const handleClick = () => {
    void trackAdClick(ad.id, placementKey);
  };

  const inner = (
    <div
      className={cn(
        "glass-card relative overflow-hidden rounded-xl border border-border/80",
        className
      )}
    >
      <span className="absolute left-2 top-2 z-10 rounded bg-black/50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
        {ad.label}
      </span>
      {ad.mediaUrl ? (
        <div className="relative aspect-[3/1] w-full min-h-[72px] max-h-[120px] overflow-hidden sm:max-h-[140px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex min-h-[72px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <p className="font-semibold truncate">{ad.title}</p>
            {ad.description && (
              <p className="text-sm text-muted line-clamp-1">{ad.description}</p>
            )}
          </div>
          {ad.ctaText && (
            <span className="shrink-0 rounded-lg bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary">
              {ad.ctaText}
            </span>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      <AdImpressionTracker advertisementId={ad.id} placementKey={placementKey} />
      {external ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer sponsored"
          onClick={handleClick}
          className="block"
        >
          {inner}
        </a>
      ) : (
        <Link href={href} onClick={handleClick} className="block">
          {inner}
        </Link>
      )}
    </>
  );
}
