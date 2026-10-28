"use client";

import { useCallback, useEffect, useState } from "react";
import { publicAssetUrl } from "@/lib/kasifind/public-asset-url";

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

export function KfListingImage({ src, alt, className, priority = false }: Props) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [failed, setFailed] = useState(false);
  const [retried, setRetried] = useState(false);

  useEffect(() => {
    setCurrentSrc(src);
    setFailed(false);
    setRetried(false);
    if (src.startsWith("/")) {
      setCurrentSrc(publicAssetUrl(src, window.location.origin));
    }
  }, [src]);

  const onError = useCallback(() => {
    if (!retried) {
      setRetried(true);
      setCurrentSrc(withCacheBust(currentSrc));
      return;
    }
    setFailed(true);
  }, [currentSrc, retried]);

  if (failed || !src) {
    return (
      <div
        className={className}
        role="img"
        aria-label={alt || "Photo unavailable"}
      >
        <span className="flex h-full min-h-[3rem] w-full items-center justify-center bg-[var(--kf-stone)] px-2 text-center text-xs text-[var(--kf-muted-soft)]">
          Photo couldn&apos;t load
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      referrerPolicy="same-origin"
      onError={onError}
    />
  );
}
