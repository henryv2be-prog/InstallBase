"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

export function KfListingImage({ src, alt, className, priority = false }: Props) {
  const originalSrc = src.trim();
  const { ref, shouldLoad } = useShouldLoadImage(priority);
  const [currentSrc, setCurrentSrc] = useState(() =>
    resolveListingImageSrc(originalSrc, typeof window !== "undefined" ? window.location.origin : null)
  );
  const [failed, setFailed] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    setCurrentSrc(
      resolveListingImageSrc(originalSrc, typeof window !== "undefined" ? window.location.origin : null)
    );
    setFailed(false);
    setRetryCount(0);
  }, [originalSrc]);

  const onError = useCallback(() => {
    if (retryCount === 0) {
      const altSrc = alternateListingImageSrc(currentSrc, originalSrc);
      if (altSrc) {
        setRetryCount(1);
        setCurrentSrc(altSrc);
        return;
      }
    }
    if (retryCount === 1) {
      setRetryCount(2);
      setCurrentSrc(withCacheBust(currentSrc));
      return;
    }
    setFailed(true);
  }, [currentSrc, originalSrc, retryCount]);

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
        alt={alt}
        className={className}
        loading="eager"
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        referrerPolicy="same-origin"
        onError={onError}
      />
    </div>
  );
}
