"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type SyntheticEvent,
} from "react";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { clampLightboxPan } from "@/lib/kasifind/kf-photo-lightbox-pan";
import { pinchDistanceFromTouches } from "@/components/kasifind/kf-photo-lightbox-lock";

const MIN_SCALE = 1;
const MAX_SCALE = 4;

type Props = {
  src: string;
  alt: string;
  resetKey: string;
};

type Pan = { x: number; y: number };

export function KfPhotoLightboxZoomImage({ src, alt, resetKey }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const scalerRef = useRef<HTMLDivElement>(null);
  const scaleRef = useRef(1);
  const panRef = useRef<Pan>({ x: 0, y: 0 });
  const pinchRef = useRef<{ startDist: number; startScale: number } | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    panX: number;
    panY: number;
  } | null>(null);
  const layoutRef = useRef({ viewportW: 0, viewportH: 0, imageW: 0, imageH: 0 });

  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const measureLayout = useCallback(() => {
    const wrap = wrapRef.current;
    const img = scalerRef.current?.querySelector("img");
    if (!wrap || !img) return;
    layoutRef.current = {
      viewportW: wrap.clientWidth,
      viewportH: wrap.clientHeight,
      imageW: img.clientWidth,
      imageH: img.clientHeight,
    };
  }, []);

  const applyPan = useCallback((nextX: number, nextY: number, currentScale: number) => {
    const { viewportW, viewportH, imageW, imageH } = layoutRef.current;
    const clamped = clampLightboxPan(nextX, nextY, currentScale, viewportW, viewportH, imageW, imageH);
    panRef.current = clamped;
    setPan(clamped);
  }, []);

  const applyScale = useCallback(
    (next: number) => {
      const clamped = Math.min(MAX_SCALE, Math.max(MIN_SCALE, next));
      scaleRef.current = clamped;
      setScale(clamped);
      if (clamped <= 1) {
        panRef.current = { x: 0, y: 0 };
        setPan({ x: 0, y: 0 });
      } else {
        applyPan(panRef.current.x, panRef.current.y, clamped);
      }
    },
    [applyPan]
  );

  useEffect(() => {
    scaleRef.current = 1;
    panRef.current = { x: 0, y: 0 };
    pinchRef.current = null;
    dragRef.current = null;
    setScale(1);
    setPan({ x: 0, y: 0 });
    setIsDragging(false);
  }, [resetKey]);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 2) return;
      dragRef.current = null;
      setIsDragging(false);
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
  }, [applyScale]);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (scaleRef.current <= 1) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    measureLayout();
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      panX: panRef.current.x,
      panY: panRef.current.y,
    };
    setIsDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    e.preventDefault();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId || scaleRef.current <= 1) return;
    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    applyPan(drag.panX + dx, drag.panY + dy, scaleRef.current);
    e.preventDefault();
  };

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== e.pointerId) return;
    dragRef.current = null;
    setIsDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
  };

  const onImageLoad = (event: SyntheticEvent<HTMLImageElement>) => {
    measureLayout();
    if (scaleRef.current > 1) {
      applyPan(panRef.current.x, panRef.current.y, scaleRef.current);
    }
    void event;
  };

  const zoomed = scale > 1.02;

  return (
    <div
      ref={wrapRef}
      className={`kf-photo-lightbox-image-wrap kf-photo-lightbox-image-wrap--zoomable${zoomed ? " is-zoomed" : ""}${isDragging ? " is-panning" : ""}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      <div
        ref={scalerRef}
        className="kf-photo-lightbox-image-scaler"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${scale})`,
        }}
      >
        <KfListingImage
          src={src}
          alt={alt}
          widthIntent="full"
          className="kf-photo-lightbox-image"
          priority
          highFetchPriority={false}
          onLoad={onImageLoad}
        />
      </div>
    </div>
  );
}