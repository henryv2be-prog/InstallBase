"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cn } from "@/lib/utils";

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_PX = 56;

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function touchDistance(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

interface ImmersiveInstallPhotoInspectProps {
  urls: string[];
  open: boolean;
  onClose: () => void;
  className?: string;
}

/** Pinch-zoom + swipe between install photos while video (and music) stay paused in the layer below. */
export function ImmersiveInstallPhotoInspect({
  urls,
  open,
  onClose,
  className,
}: ImmersiveInstallPhotoInspectProps) {
  const [index, setIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });

  const surfaceRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const dragRef = useRef({ x: 0, y: 0 });

  indexRef.current = index;
  scaleRef.current = scale;
  txRef.current = tx;
  tyRef.current = ty;
  dragRef.current = drag;

  const resetTransform = useCallback(() => {
    setScale(1);
    setTx(0);
    setTy(0);
    setDrag({ x: 0, y: 0 });
    scaleRef.current = 1;
    txRef.current = 0;
    tyRef.current = 0;
    dragRef.current = { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    if (!open) return;
    resetTransform();
    setIndex(0);
  }, [open, resetTransform]);

  useEffect(() => {
    resetTransform();
  }, [index, resetTransform]);

  useEffect(() => {
    if (!open) return;
    const scroller = document.querySelector(".immersive-feed-scroll");
    if (!(scroller instanceof HTMLElement)) return;
    const prevOverflow = scroller.style.overflow;
    const prevTouch = scroller.style.touchAction;
    scroller.style.overflow = "hidden";
    scroller.style.touchAction = "none";
    return () => {
      scroller.style.overflow = prevOverflow;
      scroller.style.touchAction = prevTouch;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const surface = surfaceRef.current;
    if (!surface) return;

    const gesture = {
      startX: 0,
      startY: 0,
      startTime: 0,
      startScale: 1,
      startDist: 0,
      startTx: 0,
      startTy: 0,
      lastTap: 0,
      pinching: false,
      moved: false,
    };

    const onTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest("button")) return;
      gesture.moved = false;
      if (event.touches.length === 2) {
        gesture.pinching = true;
        gesture.startDist = touchDistance(event.touches[0], event.touches[1]);
        gesture.startScale = scaleRef.current;
        return;
      }
      if (event.touches.length === 1) {
        gesture.pinching = false;
        gesture.startX = event.touches[0].clientX;
        gesture.startY = event.touches[0].clientY;
        gesture.startTime = Date.now();
        gesture.startTx = txRef.current;
        gesture.startTy = tyRef.current;
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length === 2) {
        event.preventDefault();
        gesture.pinching = true;
        gesture.moved = true;
        const dist = touchDistance(event.touches[0], event.touches[1]);
        const nextScale = clamp(
          gesture.startScale * (dist / Math.max(gesture.startDist, 1)),
          MIN_SCALE,
          MAX_SCALE
        );
        setScale(nextScale);
        scaleRef.current = nextScale;
        if (nextScale <= 1.02) {
          setTx(0);
          setTy(0);
          txRef.current = 0;
          tyRef.current = 0;
        }
        return;
      }

      if (event.touches.length !== 1 || gesture.pinching) return;

      const dx = event.touches[0].clientX - gesture.startX;
      const dy = event.touches[0].clientY - gesture.startY;
      if (Math.hypot(dx, dy) > 8) {
        gesture.moved = true;
        event.preventDefault();
      }

      if (scaleRef.current > 1.02) {
        const nextTx = gesture.startTx + dx;
        const nextTy = gesture.startTy + dy;
        setTx(nextTx);
        setTy(nextTy);
        txRef.current = nextTx;
        tyRef.current = nextTy;
        return;
      }

      let nextX = dx;
      let nextY = dy;
      const atStart = indexRef.current === 0 && dx > 0;
      const atEnd = indexRef.current === urls.length - 1 && dx < 0;
      if (atStart || atEnd) nextX = dx * 0.35;
      if (Math.abs(dy) > Math.abs(dx)) nextX = dx * 0.15;
      else nextY = dy * 0.15;
      setDrag({ x: nextX, y: nextY });
      dragRef.current = { x: nextX, y: nextY };
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        if (event.touches.length === 1) {
          gesture.startX = event.touches[0].clientX;
          gesture.startY = event.touches[0].clientY;
          gesture.startTx = txRef.current;
          gesture.startTy = tyRef.current;
          gesture.startScale = scaleRef.current;
        }
        return;
      }

      if (gesture.pinching) {
        gesture.pinching = false;
        if (scaleRef.current <= 1.05) resetTransform();
        return;
      }

      const now = Date.now();
      const dx = dragRef.current.x;
      const dy = dragRef.current.y;
      const dt = Math.max(now - gesture.startTime, 1);
      const vx = dx / dt;

      if (!gesture.moved) {
        if (now - gesture.lastTap < 280) {
          gesture.lastTap = 0;
          if (scaleRef.current > 1.05) resetTransform();
          else {
            setScale(2.4);
            scaleRef.current = 2.4;
          }
          setDrag({ x: 0, y: 0 });
          dragRef.current = { x: 0, y: 0 };
          return;
        }
        gesture.lastTap = now;
        setDrag({ x: 0, y: 0 });
        dragRef.current = { x: 0, y: 0 };
        return;
      }

      if (scaleRef.current > 1.02) return;

      const horizontal = Math.abs(dx) > Math.abs(dy);
      const current = indexRef.current;
      if (horizontal && (dx < -SWIPE_PX || vx < -0.45) && current < urls.length - 1) {
        setIndex(current + 1);
      } else if (horizontal && (dx > SWIPE_PX || vx > 0.45) && current > 0) {
        setIndex(current - 1);
      }
      setDrag({ x: 0, y: 0 });
      dragRef.current = { x: 0, y: 0 };
    };

    surface.addEventListener("touchstart", onTouchStart, { passive: true });
    surface.addEventListener("touchmove", onTouchMove, { passive: false });
    surface.addEventListener("touchend", onTouchEnd);
    surface.addEventListener("touchcancel", onTouchEnd);
    return () => {
      surface.removeEventListener("touchstart", onTouchStart);
      surface.removeEventListener("touchmove", onTouchMove);
      surface.removeEventListener("touchend", onTouchEnd);
      surface.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [open, resetTransform, urls.length]);

  if (!open || urls.length === 0) return null;

  const url = urls[index] ?? urls[0];

  return (
    <div
      className={cn(
        "absolute inset-0 z-[25] flex flex-col bg-black touch-none",
        className
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Install photos"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={onClose}
          className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-white/15 px-3.5 py-2 text-sm font-semibold text-white backdrop-blur-sm"
        >
          <X className="h-4 w-4" aria-hidden />
          Back to video
        </button>
        {urls.length > 1 && (
          <span className="text-xs font-medium text-white/75">
            {index + 1} / {urls.length}
          </span>
        )}
      </div>

      <div ref={surfaceRef} className="relative min-h-0 flex-1 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          className="pointer-events-none absolute left-1/2 top-1/2 max-h-full max-w-full select-none object-contain"
          style={{
            transform: `translate(calc(-50% + ${tx + drag.x}px), calc(-50% + ${ty + drag.y}px)) scale(${scale})`,
          }}
          draggable={false}
        />
      </div>

      {urls.length > 1 && (
        <div className="flex shrink-0 items-center justify-center gap-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white disabled:opacity-35"
            aria-label="Previous photo"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            disabled={index >= urls.length - 1}
            onClick={() => setIndex((i) => Math.min(urls.length - 1, i + 1))}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white disabled:opacity-35"
            aria-label="Next photo"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      )}

      <p className="pointer-events-none absolute inset-x-0 bottom-[max(4.5rem,env(safe-area-inset-bottom))] text-center text-[11px] text-white/55">
        Pinch or double-tap to zoom · swipe for more photos
      </p>
    </div>
  );
}
