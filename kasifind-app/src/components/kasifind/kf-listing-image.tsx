"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type SyntheticEvent } from "react";
import {
  buildListingImageDelivery,
  listingImageOriginalDelivery,
  type ListingImageWidthIntent,
} from "@/lib/kasifind/listing-image-delivery";
import {
  alternateListingImageSrc,
  resolveListingImageSrc,
} from "@/lib/kasifind/resolve-listing-image-src";

type Props = {
  src: string;
  alt: string;
  className?: string;
  /** Load immediately (search cards, hero photos). */
  priority?: boolean;
  /** Chooses default variant width and `sizes` for responsive WebP delivery. */
  widthIntent?: ListingImageWidthIntent;
  onLoad?: (event: SyntheticEvent<HTMLImageElement>) => void;
};

function withCacheBust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}t=${Date.now()}`;
}

function useShouldLoadImage(priority: boolean) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shouldLoad, setShouldLoad] = useState(priority);

  useEffect(() => {
    if (priority) {
      setShouldLoad(true);
      return;
    }
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === "undefined") {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "240px 0px", threshold: 0.01 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  return { ref, shouldLoad };
}

export function KfListingImage({
  src,
  alt,
  className,
  priority = false,
  widthIntent = "gallery",
  onLoad,
}: Props) {
  const originalSrc = src.trim();
  const origin = typeof window !== "undefined" ? window.location.origin : null;
  const { ref, shouldLoad } = useShouldLoadImage(priority);
  const [useResponsive, setUseResponsive] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const [failed, setFailed] = useState(false);

  const responsiveDelivery = useMemo(
    () => buildListingImageDelivery(originalSrc, widthIntent, origin),
    [originalSrc, widthIntent, origin]
  );

  const [currentSrc, setCurrentSrc] = useState(responsiveDelivery.src);
  const [srcSet, setSrcSet] = useState<string | undefined>(responsiveDelivery.srcSet);
  const [sizes, setSizes] = useState<string | undefined>(responsiveDelivery.sizes);

  useEffect(() => {
    setUseResponsive(true);
    setRetryCount(0);
    setFailed(false);
    const delivery = buildListingImageDelivery(originalSrc, widthIntent, origin);
    setCurrentSrc(delivery.src);
    setSrcSet(delivery.srcSet);
    setSizes(delivery.sizes);
  }, [originalSrc, widthIntent, origin]);

  const onError = useCallback(() => {
    if (useResponsive && responsiveDelivery.srcSet) {
      setUseResponsive(false);
      const fallback = listingImageOriginalDelivery(responsiveDelivery.canonicalOriginal, origin);
      setCurrentSrc(fallback.src);
      setSrcSet(undefined);
      setSizes(undefined);
      setRetryCount(1);
      return;
    }
    if (retryCount <= 1) {
      const altSrc = alternateListingImageSrc(currentSrc, originalSrc);
      if (altSrc) {
        setRetryCount((c) => c + 1);
        setCurrentSrc(altSrc);
        return;
      }
    }
    if (retryCount <= 2) {
      setRetryCount(3);
      setCurrentSrc(withCacheBust(currentSrc));
      return;
    }
    setFailed(true);
  }, [currentSrc, originalSrc, responsiveDelivery, retryCount, useResponsive, origin]);

  if (!originalSrc) {
    return null;
  }

  if (failed) {
    return (
      <div ref={ref} className={className} role="img" aria-label={alt || "Photo unavailable"}>
        <span className="flex h-full min-h-[3rem] w-full items-center justify-center bg-[var(--kf-stone)] px-2 text-center text-xs text-[var(--kf-muted-soft)]">
          Photo couldn&apos;t load
        </span>
      </div>
    );
  }

  if (!shouldLoad) {
    return (
      <div
        ref={ref}
        className={`kf-listing-image-placeholder ${className ?? ""}`}
        aria-hidden
      />
    );
  }

  return (
    <div ref={ref} className="kf-listing-image-wrap">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={currentSrc}
        srcSet={useResponsive ? srcSet : undefined}
        sizes={useResponsive ? sizes : undefined}
        alt={alt}
        className={className}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="same-origin"
        onError={onError}
        onLoad={onLoad}
      />
    </div>
  );
}