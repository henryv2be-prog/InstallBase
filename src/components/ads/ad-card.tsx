"use client";

import Link from "next/link";
import { ExternalLink } from "lucide-react";
import type { AdCreative } from "@/lib/advertising/types";
import { AdImpressionTracker, trackAdClick } from "@/components/ads/ad-tracker";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AdCardProps {
  ad: AdCreative;
  placementKey: string;
  className?: string;
  compact?: boolean;
}

export function AdCard({ ad, placementKey, className, compact }: AdCardProps) {
  const href = ad.destinationUrl;
  const external = !ad.isInternalLink;

  const handleClick = () => {
    void trackAdClick(ad.id, placementKey);
  };

  const content = (
    <article
      className={cn(
        "glass-card overflow-hidden rounded-2xl border border-border/80",
        className
      )}
    >
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {ad.label}
        </span>
        {ad.advertiserName && (
          <span className="truncate text-xs text-muted">{ad.advertiserName}</span>
        )}
      </div>

      {ad.mediaUrl && (
        <div className={cn("relative w-full overflow-hidden bg-gray-100 dark:bg-gray-800", compact ? "aspect-[2/1]" : "aspect-video")}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={ad.mediaUrl}
            alt={ad.title}
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      )}

      <div className="p-4">
        <h3 className="font-semibold leading-snug">{ad.title}</h3>
        {ad.description && !compact && (
          <p className="mt-1 text-sm text-muted line-clamp-2">{ad.description}</p>
        )}
        {ad.ctaText && (
          <div className="mt-3">
            <Button size="sm" variant="outline" className="pointer-events-none">
              {ad.ctaText}
              {external && <ExternalLink className="ml-1.5 h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
      </div>
    </article>
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
          className="block transition-opacity hover:opacity-95"
        >
          {content}
        </a>
      ) : (
        <Link href={href} onClick={handleClick} className="block transition-opacity hover:opacity-95">
          {content}
        </Link>
      )}
    </>
  );
}
