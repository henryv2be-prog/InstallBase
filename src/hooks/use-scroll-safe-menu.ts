"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MOVE_THRESHOLD_PX = 12;
const LONG_PRESS_MS = 450;

function useRequiresLongPress() {
  const [requiresLongPress, setRequiresLongPress] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(hover: none), (pointer: coarse)");
    const update = () => setRequiresLongPress(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return requiresLongPress;
}

/**
 * Touch: press and hold to open. Desktop: normal click.
 * Ignores opens that happen at the end of a scroll gesture.
 */
export function useScrollSafeMenu() {
  const [open, setOpen] = useState(false);
  const [pressing, setPressing] = useState(false);
  const requiresLongPress = useRequiresLongPress();
  const gestureRef = useRef({ moved: false, scrolled: false, timer: 0 });

  useEffect(() => {
    const onScroll = () => {
      gestureRef.current.scrolled = true;
      if (gestureRef.current.timer) {
        window.clearTimeout(gestureRef.current.timer);
        gestureRef.current.timer = 0;
        setPressing(false);
      }
    };
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => window.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  const onOpenChange = useCallback(
    (next: boolean) => {
      if (!next) {
        setOpen(false);
        return;
      }
      if (requiresLongPress) return;
      if (gestureRef.current.moved || gestureRef.current.scrolled) return;
      setOpen(true);
    },
    [requiresLongPress]
  );

  const triggerProps = {
    onClick: (event: React.MouseEvent<HTMLElement>) => {
      if (requiresLongPress) {
        event.preventDefault();
        event.stopPropagation();
      }
    },
    onPointerDown: (event: React.PointerEvent<HTMLElement>) => {
      const startX = event.clientX;
      const startY = event.clientY;
      gestureRef.current = { moved: false, scrolled: false, timer: 0 };

      const clearTimer = () => {
        if (gestureRef.current.timer) {
          window.clearTimeout(gestureRef.current.timer);
          gestureRef.current.timer = 0;
        }
      };

      const onMove = (moveEvent: PointerEvent) => {
        if (moveEvent.pointerId !== event.pointerId) return;
        if (
          Math.hypot(moveEvent.clientX - startX, moveEvent.clientY - startY) > MOVE_THRESHOLD_PX
        ) {
          gestureRef.current.moved = true;
          clearTimer();
          setPressing(false);
        }
      };

      const onUp = () => {
        clearTimer();
        setPressing(false);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        window.removeEventListener("pointercancel", onUp);
      };

      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);

      if (!requiresLongPress) return;

      setPressing(true);
      gestureRef.current.timer = window.setTimeout(() => {
        gestureRef.current.timer = 0;
        if (!gestureRef.current.moved && !gestureRef.current.scrolled) {
          setOpen(true);
          navigator.vibrate?.(12);
        }
        setPressing(false);
      }, LONG_PRESS_MS);
    },
  };

  return {
    open,
    onOpenChange,
    triggerProps,
    pressing,
    requiresLongPress,
  };
}

export const MENU_LONG_PRESS_MS = LONG_PRESS_MS;
