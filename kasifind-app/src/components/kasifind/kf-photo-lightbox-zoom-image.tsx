"use client";

import { useEffect, useRef, useState } from "react";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { pinchDistanceFromTouches } from "@/components/kasifind/kf-photo-lightbox-lock";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Props = {
  src: string;
  alt: string;
  resetKey: string;
};

export function KfPhotoLightboxZoomImage({ src, alt, resetKey }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    scaleRef.current = 1;
    setScale(1);
    pinchRef.current = null;
  }, [resetKey]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const applyScale = (next: number) => {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      scaleRef.current = clamped;
      setScale(clamped);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      pinchRef.current = {
        startDist: pinchDistanceFromTouches(e.touches),
        startScale: scaleRef.current,
      };
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2 || !pinchRef.current) return;
      e.preventDefault();
      const dist = pinchDistanceFromTouches(e.touches);
      if (dist <= 0 || pinchRef.current.startDist <= 0) return;
      applyScale(pinchRef.current.startScale * (dist / pinchRef.current.startDist));
    };

    const onTouchEnd = () => {
      pinchRef.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className="kf-photo-lightbox-image-wrap kf-photo-lightbox-image-wrap--zoomable"
    >
      <div
        className="kf-photo-lightbox-image-scaler"
        style={{ transform: `scale(${scale})` }}
      >
        <KfListingImage
          src={src}
          alt={alt}
          className="kf-photo-lightbox-image"
          priority
        />
      </div>
    </div>
  );
}