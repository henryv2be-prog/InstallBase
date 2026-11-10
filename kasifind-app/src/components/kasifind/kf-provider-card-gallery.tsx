"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  alternateListingImageSrc,
  resolveListingImageSrc,
} from "@/lib/kasifind/resolve-listing-image-src";

const SLIDE_MS = 3000;
const FADE_MS = 550;

type Props = {
  photos: readonly string[];
  priority?: boolean;
  displayName: string;
};

function resolvedSrc(url: string): string {
  return resolveListingImageSrc(
    url,
    typeof window !== "undefined" ? window.location.origin : null
  );
}

export function KfProviderCardGallery({ photos, priority = false, displayName }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [inView, setInView] = useState(priority);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [failedUrls, setFailedUrls] = useState<Set<string>>(() => new Set());

  const visiblePhotos = useMemo(
    () => photos.filter((p) => !failedUrls.has(p)),
    [photos, failedUrls]
  );

  const slideshow = visiblePhotos.length > 1 && !reducedMotion;

  useEffect(() => {
    setActiveIndex(0);
    setFailedUrls(new Set());
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

  useEffect(() => {
    if (!slideshow || !inView || visiblePhotos.length < 2) return;
    const nextIndex = (activeIndex + 1) % visiblePhotos.length;
    const nextUrl = visiblePhotos[nextIndex];
    if (!nextUrl) return;
    const img = new window.Image();
    img.decoding = "async";
    img.src = resolvedSrc(nextUrl);
  }, [activeIndex, inView, slideshow, visiblePhotos]);

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
    return (
      <div className="kf-provider-thumb-placeholder">
        <span className="font-semibold text-[var(--kf-muted)]">No photo yet</span>
      </div>
    );
  }

  const safeIndex = Math.min(activeIndex, visiblePhotos.length - 1);
  const altBase = displayName.trim() || "Provider";

  return (
    <div
      ref={rootRef}
      className="kf-provider-card-gallery"
      data-slideshow={slideshow ? "on" : "off"}
    >
      {visiblePhotos.map((originalUrl, index) => (
        <GalleryLayer
          key={originalUrl}
          originalUrl={originalUrl}
          alt={`${altBase} — photo ${index + 1} of ${visiblePhotos.length}`}
          active={index === safeIndex}
          priority={priority && index === 0}
          onFailed={(currentSrc, retried) => onImgError(originalUrl, currentSrc, retried)}
        />
      ))}

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
  const [src, setSrc] = useState(() => resolvedSrc(originalUrl));
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    setSrc(resolvedSrc(originalUrl));
    setRetry(0);
  }, [originalUrl]);

  const handleError = () => {
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
