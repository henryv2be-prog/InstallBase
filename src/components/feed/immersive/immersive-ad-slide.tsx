"use client";

import { useEffect, useRef } from "react";
import type { AdCreative } from "@/lib/advertising/types";
import { AdRenderer } from "@/components/ads/ad-renderer";

interface ImmersiveAdSlideProps {
  ad: AdCreative;
  placementKey: string;
  slideHeightClass: string;
  active: boolean;
  onVisible?: () => void;
}

export function ImmersiveAdSlide({
  ad,
  placementKey,
  slideHeightClass,
  active,
  onVisible,
}: ImmersiveAdSlideProps) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node || !onVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          onVisible();
        }
      },
      { threshold: [0.55, 0.75] }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [onVisible]);

  return (
    <section
      ref={ref}
      data-active={active ? "true" : "false"}
      className={`immersive-feed-slide relative flex w-full shrink-0 snap-start snap-always items-center justify-center overflow-hidden bg-black/95 ${slideHeightClass}`}
      aria-label="Sponsored"
    >
      <div className="w-full max-w-md px-4 py-8">
        <AdRenderer ad={ad} placementKey={placementKey} />
      </div>
    </section>
  );
}
