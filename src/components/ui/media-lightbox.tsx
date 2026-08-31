"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface MediaItem {
  url: string;
  type?: string;
  caption?: string | null;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const SWIPE_PX = 56;
const VERTICAL_CLOSE_PX = 110;
const APP_VIEWPORT = "width=device-width, initial-scale=1, viewport-fit=cover";
const LOCKED_VIEWPORT =
  "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover";

let restoreViewportTimer = 0;

function appViewportContent(meta: Element | null) {
  const stored = document.documentElement.dataset.appViewport;
  if (stored) return stored;
  const current = meta?.getAttribute("content") || APP_VIEWPORT;
  const value = current.includes("user-scalable=no") ? APP_VIEWPORT : current;
  document.documentElement.dataset.appViewport = value;
  return value;
}

function isVideo(type?: string, url?: string) {
  return type === "video" || Boolean(url?.match(/\.(mp4|webm|mov)(\?|$)/i));
}

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function touchDistance(a: Touch, b: Touch) {
  return Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
}

function useLockPageZoom() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtmlTouch = html.style.touchAction;
    const prevBodyTouch = body.style.touchAction;
    const prevOverflow = body.style.overflow;
    html.style.touchAction = "none";
    body.style.touchAction = "none";
    body.style.overflow = "hidden";

    const meta = document.querySelector('meta[name="viewport"]');
    const restoreTo = appViewportContent(meta);
    window.clearTimeout(restoreViewportTimer);
    meta?.setAttribute("content", LOCKED_VIEWPORT);

    const observer = meta
      ? new MutationObserver(() => {
          if (meta.getAttribute("content") !== LOCKED_VIEWPORT) {
            meta.setAttribute("content", LOCKED_VIEWPORT);
          }
        })
      : null;
    if (meta && observer) observer.observe(meta, { attributes: true, attributeFilter: ["content"] });

    const prevent = (event: Event) => event.preventDefault();
    document.addEventListener("gesturestart", prevent, { capture: true });
    document.addEventListener("gesturechange", prevent, { capture: true });
    document.addEventListener("gestureend", prevent, { capture: true });

    const preventPinch = (event: TouchEvent) => {
      if (event.touches.length > 1) event.preventDefault();
    };
    document.addEventListener("touchmove", preventPinch, { passive: false, capture: true });

    return () => {
      observer?.disconnect();
      html.style.touchAction = prevHtmlTouch;
      body.style.touchAction = prevBodyTouch;
      body.style.overflow = prevOverflow;
      document.removeEventListener("gesturestart", prevent, { capture: true });
      document.removeEventListener("gesturechange", prevent, { capture: true });
      document.removeEventListener("gestureend", prevent, { capture: true });
      document.removeEventListener("touchmove", preventPinch, { capture: true });
      if (!meta) return;
      meta.setAttribute("content", LOCKED_VIEWPORT);
      window.scrollTo(0, window.scrollY);
      restoreViewportTimer = window.setTimeout(() => {
        meta.setAttribute("content", restoreTo);
      }, 50);
    };
  }, []);
}

interface MediaLightboxProps {
  items: MediaItem[];
  index: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export function MediaLightbox({ items, index, onClose, onIndexChange }: MediaLightboxProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(index);
  const scaleRef = useRef(1);
  const txRef = useRef(0);
  const tyRef = useRef(0);
  const dragRef = useRef({ x: 0, y: 0 });
  const ignoreClickRef = useRef(false);

  const [scale, setScale] = useState(1);
  const [tx, setTx] = useState(0);
  const [ty, setTy] = useState(0);
  const [drag, setDrag] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);

  indexRef.current = index;
  scaleRef.current = scale;
  txRef.current = tx;
  tyRef.current = ty;
  dragRef.current = drag;

  useLockPageZoom();

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
    resetTransform();
  }, [index, resetTransform]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") onIndexChange(Math.min(indexRef.current + 1, items.length - 1));
      if (event.key === "ArrowLeft") onIndexChange(Math.max(indexRef.current - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [items.length, onClose, onIndexChange]);

  useEffect(() => {
    const overlay = overlayRef.current;
    if (!overlay) return;

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
      skip: false,
    };

    const onTouchStart = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null;
      gesture.skip = Boolean(target?.closest("button, video"));
      gesture.moved = false;
      if (gesture.skip) return;
      if (event.touches.length === 2) {
        gesture.pinching = true;
        gesture.startDist = touchDistance(event.touches[0], event.touches[1]);
        gesture.startScale = scaleRef.current;
        ignoreClickRef.current = true;
        return;
      }
      if (event.touches.length === 1) {
        gesture.pinching = false;
        gesture.startX = event.touches[0].clientX;
        gesture.startY = event.touches[0].clientY;
        gesture.startTime = Date.now();
        gesture.startTx = txRef.current;
        gesture.startTy = tyRef.current;
        setDragging(true);
      }
    };

    const onTouchMove = (event: TouchEvent) => {
      if (gesture.skip) return;
      if (event.touches.length === 2) {
        event.preventDefault();
        gesture.pinching = true;
        gesture.moved = true;
        ignoreClickRef.current = true;
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
        ignoreClickRef.current = true;
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
      const atEnd = indexRef.current === items.length - 1 && dx < 0;
      if (atStart || atEnd) nextX = dx * 0.35;
      if (Math.abs(dy) > Math.abs(dx)) nextX = dx * 0.15;
      else nextY = dy * 0.15;
      setDrag({ x: nextX, y: nextY });
      dragRef.current = { x: nextX, y: nextY };
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (gesture.skip) {
        if (event.touches.length === 0) {
          gesture.skip = false;
          setDragging(false);
        }
        return;
      }
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

      setDragging(false);

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
          ignoreClickRef.current = true;
          if (scaleRef.current > 1.05) resetTransform();
          else {
            setScale(2.4);
            scaleRef.current = 2.4;
          }
          return;
        }
        gesture.lastTap = now;
        setDrag({ x: 0, y: 0 });
        dragRef.current = { x: 0, y: 0 };
        return;
      }

      if (scaleRef.current > 1.02) return;

      if (dy > VERTICAL_CLOSE_PX && Math.abs(dy) > Math.abs(dx) * 1.15) {
        onClose();
        return;
      }

      const horizontal = Math.abs(dx) > Math.abs(dy);
      const current = indexRef.current;
      if (horizontal && (dx < -SWIPE_PX || vx < -0.45) && current < items.length - 1) {
        setDrag({ x: 0, y: 0 });
        dragRef.current = { x: 0, y: 0 };
        onIndexChange(current + 1);
        return;
      }
      if (horizontal && (dx > SWIPE_PX || vx > 0.45) && current > 0) {
        setDrag({ x: 0, y: 0 });
        dragRef.current = { x: 0, y: 0 };
        onIndexChange(current - 1);
        return;
      }

      setDrag({ x: 0, y: 0 });
      dragRef.current = { x: 0, y: 0 };
    };

    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return;
      event.preventDefault();
      const next = clamp(scaleRef.current * (event.deltaY > 0 ? 0.92 : 1.08), MIN_SCALE, MAX_SCALE);
      setScale(next);
      scaleRef.current = next;
      if (next <= 1.02) {
        setTx(0);
        setTy(0);
        txRef.current = 0;
        tyRef.current = 0;
      }
    };

    overlay.addEventListener("touchstart", onTouchStart, { passive: true });
    overlay.addEventListener("touchmove", onTouchMove, { passive: false });
    overlay.addEventListener("touchend", onTouchEnd);
    overlay.addEventListener("touchcancel", onTouchEnd);
    overlay.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      overlay.removeEventListener("touchstart", onTouchStart);
      overlay.removeEventListener("touchmove", onTouchMove);
      overlay.removeEventListener("touchend", onTouchEnd);
      overlay.removeEventListener("touchcancel", onTouchEnd);
      overlay.removeEventListener("wheel", onWheel);
    };
  }, [items.length, onClose, onIndexChange, resetTransform]);

  const active = items[index];
  if (!active) return null;

  const opacity = clamp(1 - Math.abs(drag.y) / 280, 0.4, 1);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[200] touch-none overscroll-none"
      style={{ backgroundColor: `rgba(0,0,0,${0.95 * opacity})` }}
      role="dialog"
      aria-modal="true"
      aria-label="Photo viewer"
      onClick={() => {
        if (ignoreClickRef.current) {
          ignoreClickRef.current = false;
          return;
        }
        onClose();
      }}
    >
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onClose();
        }}
        className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] z-20 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
        aria-label="Close"
      >
        <X className="h-6 w-6" />
      </button>

      {items.length > 1 && index > 0 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIndexChange(index - 1);
          }}
          className="absolute left-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:flex"
          aria-label="Previous photo"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
      )}

      {items.length > 1 && index < items.length - 1 && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onIndexChange(index + 1);
          }}
          className="absolute right-3 top-1/2 z-20 hidden -translate-y-1/2 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 sm:flex"
          aria-label="Next photo"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      )}

      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
        style={{
          transform: `translate3d(${drag.x}px, ${drag.y}px, 0)`,
          transition: dragging ? "none" : "transform 220ms ease-out",
        }}
      >
        {isVideo(active.type, active.url) ? (
          <video
            key={active.url}
            src={active.url}
            controls
            autoPlay
            playsInline
            className="pointer-events-auto max-h-[85dvh] max-w-[92vw] rounded-lg"
            onClick={(event) => event.stopPropagation()}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={active.url}
            src={active.url}
            alt={active.caption ?? "Installation photo"}
            draggable={false}
            className="pointer-events-auto max-h-[85dvh] max-w-[92vw] select-none rounded-lg object-contain"
            onClick={(event) => event.stopPropagation()}
            style={{
              transform: `translate3d(${tx}px, ${ty}px, 0) scale(${scale})`,
              transition: dragging ? "none" : "transform 160ms ease-out",
              transformOrigin: "center center",
              willChange: "transform",
            }}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-[max(1rem,env(safe-area-inset-bottom))] z-20 flex flex-col items-center gap-2">
        {active.caption && <p className="px-6 text-center text-sm text-white/80">{active.caption}</p>}
        {items.length > 1 && (
          <>
            <p className="text-xs text-white/70">
              {index + 1} / {items.length}
            </p>
            <div className="flex items-center gap-1.5">
              {items.map((item, i) => (
                <span
                  key={`${item.url}-${i}`}
                  className={`h-1.5 rounded-full ${i === index ? "w-4 bg-white" : "w-1.5 bg-white/35"}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
