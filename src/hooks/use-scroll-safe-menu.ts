"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MOVE_THRESHOLD_PX = 12;

/**
 * Ignores menu opens that happen at the end of a scroll gesture — common on touch feeds.
 */
export function useScrollSafeMenu() {
  const [open, setOpen] = useState(false);
  const gestureRef = useRef({ moved: false, scrolled: false });

  useEffect(() => {
    const onScroll = () => {
      gestureRef.current.scrolled = true;
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  const onOpenChange = useCallback((next: boolean) => {
    if (!next) {
      setOpen(false);
      return;
    }
    if (gestureRef.current.moved || gestureRef.current.scrolled) {
      return;
    }
    setOpen(true);
  }, []);

  const triggerProps = {
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      const startX = event.clientX;
      const startY = event.clientY;
      gestureRef.current = { moved: false, scrolled: false };

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        if (
          Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > MOVE_THRESHOLD_PX
        ) {
          gestureRef.current.moved = true;
        }
      };

      const cleanup = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", cleanup);
        window.removeEventListener("pointercancel", cleanup);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", cleanup);
      window.addEventListener("pointercancel", cleanup);
    },
  };

  return { open, onOpenChange, triggerProps };
}
