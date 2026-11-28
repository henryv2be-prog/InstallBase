"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { KfListingNoPhotoPlaceholder } from "@/components/kasifind/kf-listing-no-photo-placeholder";
import {
  buildListingImageDelivery,
  listingImageOriginalDelivery,
} from "@/lib/kasifind/listing-image-delivery";
import {
  alternateListingImageSrc,
  resolveListingImageSrc,
} from "@/lib/kasifind/resolve-listing-image-src";

const SLIDE_MS = 3000;
const FADE_MS = 550;

/** Pure helper for slideshow prefetch: active slide plus at most one ahead. */
export function mergeCardGalleryLoadedIndices(
  prev: Set<number>,
  safeIndex: number,
  slideshow: boolean,
  inView: boolean,
  photoCount: number
): Set<number> {
  const next = new Set(prev);
  next.add(safeIndex);
  if (slideshow && inView && photoCount > 1) {
    next.add((safeIndex + 1) % photoCount);
  }
  return next;
}

type Props = {
  photos: readonly string[];
  priority?: boolean;
  displayName: string;
  categoryName?: string | null;
};

function resolvedSrc(url: string): string {
  return resolveListingImageSrc(
    url,
    typeof window !== "undefined" ? window.location.origin : null
  );
}

export function KfProviderCardGallery({
  photos,
  priority = false,
  displayName,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(priority);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());
  /** Gallery photo indices allowed to issue a network request (active slide + at most one ahead). */
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(() => new Set([0]));

  const visiblePhotos = useMemo(
    () => photos.filter((p) => !failedUrls.has(p)),
    [photos, failedUrls]
  );

  const slideshow = visiblePhotos.length > 1 && !reducedMotion;

  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls(new Set());
    setLoadedIndices(new Set([0]));
  }, [photos]);

  useEffect(() => {
    setActiveIndex((i) =>
      visiblePhotos.length ? Math.min(i, visiblePhotos.length - 1) : 0
    );
  }, [visiblePhotos.length]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries.some((e) => e.isIntersecting));
      },
      { rootMargin: "48px 0px", threshold: 0.15 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!slideshow || !inView) return;
    const id = window.setInterval(() => {
      setActiveIndex((i) => (i + 1) % visiblePhotos.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slideshow, inView, visiblePhotos.length]);

  const safeIndex = Math.min(activeIndex, Math.max(visiblePhotos.length - 1, 0));

  useEffect(() => {
    setLoadedIndices((prev) =>
      mergeCardGalleryLoadedIndices(prev, safeIndex, slideshow, inView, visiblePhotos.length)
    );
  }, [safeIndex, slideshow, inView, visiblePhotos.length]);

  const onImgError = useCallback(
    (originalUrl: string, currentSrc: string, retried: boolean) => {
      if (!retried) {
        const alt = alternateListingImageSrc(currentSrc, originalUrl);
        if (alt) return alt;
      }
      setFailedUrls((prev) => {
        const next = new Set(prev);
        next.add(originalUrl);
        return next;
      });
      return null;
    },
    []
  );

  if (visiblePhotos.length === 0) {
    const label = displayName.trim() || "Local provider";
    return (
      <KfListingNoPhotoPlaceholder
        displayName={label}
        priority={priority}
        className="kf-provider-thumb-placeholder kf-listing-no-photo-art"
      />
    );
  }

  const altBase = displayName.trim() || "Provider";

  return (
    <div
      ref={rootRef}
      className="kf-provider-card-gallery"
      data-slideshow={slideshow ? "on" : "off"}
    >
      {visiblePhotos.map((originalUrl, index) =>
        loadedIndices.has(index) ? (
          <GalleryLayer
            key={originalUrl}
            originalUrl={originalUrl}
            alt={`${altBase} — photo ${index + 1} of ${visiblePhotos.length}`}
            active={index === safeIndex}
            priority={priority && index === 0}
            onFailed={(currentSrc, retried) => onImgError(originalUrl, currentSrc, retried)}
          />
        ) : null
      )}

      {slideshow ? (
        <GalleryIndicator
          className="kf-provider-card-gallery__indicator"
          current={safeIndex + 1}
          total={visiblePhotos.length}
        />
      ) : null}
    </div>
  );
}

function GalleryLayer({
  originalUrl,
  alt,
  active,
  priority,
  onFailed,
}: {
  originalUrl: string;
  alt: string;
  active: boolean;
  priority: boolean;
  onFailed: (currentSrc: string, retried: boolean) => string | null;
}) {
  const origin = typeof window !== "undefined" ? window.location.origin : null;
  const initialDelivery = buildListingImageDelivery(originalUrl, "card", origin);
  const [src, setSrc] = useState(initialDelivery.src);
  const [srcSet, setSrcSet] = useState<string | undefined>(initialDelivery.srcSet);
  const [sizes, setSizes] = useState<string | undefined>(initialDelivery.sizes);
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    const delivery = buildListingImageDelivery(originalUrl, "card", origin);
    setSrc(delivery.src);
    setSrcSet(delivery.srcSet);
    setSizes(delivery.sizes);
    setRetry(0);
  }, [originalUrl, origin]);

  const handleError = () => {
    if (srcSet && retry === 0) {
      const fallback = listingImageOriginalDelivery(originalUrl, origin);
      setSrc(fallback.src);
      setSrcSet(undefined);
      setSizes(undefined);
      setRetry(1);
      return;
    }
    const next = onFailed(src, retry > 0);
    if (next) {
      setRetry((r) => r + 1);
      setSrc(next);
    }
  };

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={`kf-provider-thumb kf-provider-card-gallery__img${active ? " is-active" : ""}`}
      style={{ transitionDuration: `${FADE_MS}ms` }}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      referrerPolicy="same-origin"
      onError={handleError}
    />
  );
}

function GalleryIndicator({
  className,
  current,
  total,
}: {
  className: string;
  current: number;
  total: number;
}) {
  return (
    <div className={className} aria-hidden>
      <span className="kf-provider-card-gallery__count">
        {current} / {total}
      </span>
      <span className="kf-provider-card-gallery__dots">
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={`kf-provider-card-gallery__dot${i + 1 === current ? " is-active" : ""}`}
          />
        ))}
      </span>
    </div>
  );
}
