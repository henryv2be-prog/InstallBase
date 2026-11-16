"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const HEADER_OFFSET_PX = 52;
const SCROLL_DELTA_HIDE = 18;
const SCROLL_TOP_REVEAL = 48;
const SCROLL_BLUR_THRESHOLD_PX = 6;
const TOUCH_SCROLL_BLUR_PX = 10;

function blurSearchFieldInBar(bar: HTMLElement | null): void {
  if (!bar || typeof document === "undefined") return;
  const active = document.activeElement;
  if (!active || !bar.contains(active)) return;
  if (
    active instanceof HTMLInputElement ||
    active instanceof HTMLTextAreaElement ||
    active instanceof HTMLSelectElement
  ) {
    active.blur();
  }
}

type PinState = {
  pinned: boolean;
  hidden: boolean;
  placeholderHeight: number;
};

type PinOptions = {
  /** When true, keep the pinned bar visible (e.g. during live search / programmatic scroll). */
  suppressHideRef?: RefObject<boolean>;
  /** Keep visible while live search is in flight. */
  keepVisible?: boolean;
};

export function useHomeSearchBarPin(
  anchorRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>,
  options?: PinOptions
): PinState {
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const pinStartY = useRef<number | null>(null);
  const interactionLockRef = useRef(false);

  useEffect(() => {
    const measureBar = () => {
      if (barRef.current) setPlaceholderHeight(barRef.current.offsetHeight);
    };
    measureBar();
    window.addEventListener("resize", measureBar);
    const bar = barRef.current;
    const resizeObserver =
      typeof ResizeObserver !== "undefined" && bar
        ? new ResizeObserver(measureBar)
        : null;
    resizeObserver?.observe(bar);
    return () => {
      window.removeEventListener("resize", measureBar);
      resizeObserver?.disconnect();
    };
  }, [barRef]);

  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        interactionLockRef.current = true;
        setHidden(false);
      }
    };

    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget;
      if (!next || !bar.contains(next as Node)) {
        interactionLockRef.current = false;
      }
    };

    bar.addEventListener("focusin", onFocusIn);
    bar.addEventListener("focusout", onFocusOut);
    return () => {
      bar.removeEventListener("focusin", onFocusIn);
      bar.removeEventListener("focusout", onFocusOut);
    };
  }, [barRef]);

  const shouldBlockHideForSearch = () =>
    Boolean(options?.keepVisible) || Boolean(options?.suppressHideRef?.current);

  useEffect(() => {
    const resolvePinStart = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      pinStartY.current = anchor.getBoundingClientRect().top + window.scrollY;
    };

    const onScroll = () => {
      if (pinStartY.current === null) resolvePinStart();
      const y = window.scrollY;
      const pinAt = (pinStartY.current ?? 0) - HEADER_OFFSET_PX;
      const isPinned = y > pinAt;

      setPinned(isPinned);
      const delta = y - lastScrollY.current;

      if (
        !shouldBlockHideForSearch() &&
        Math.abs(delta) >= SCROLL_BLUR_THRESHOLD_PX &&
        interactionLockRef.current
      ) {
        blurSearchFieldInBar(barRef.current);
      }

      if (shouldBlockHideForSearch()) {
        setHidden(false);
        lastScrollY.current = y;
        return;
      }

      if (y < SCROLL_TOP_REVEAL) {
        setHidden(false);
      } else if (isPinned) {
        if (delta > SCROLL_DELTA_HIDE) {
          setHidden(true);
        } else if (delta < -SCROLL_DELTA_HIDE) {
          setHidden(false);
        } else if (interactionLockRef.current) {
          setHidden(false);
        }
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    const onResize = () => {
      pinStartY.current = null;
      resolvePinStart();
      onScroll();
    };

    resolvePinStart();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    let touchStartY = 0;
    const onTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (shouldBlockHideForSearch() || !interactionLockRef.current) return;
      const y = event.touches[0]?.clientY ?? touchStartY;
      if (Math.abs(y - touchStartY) >= TOUCH_SCROLL_BLUR_PX) {
        blurSearchFieldInBar(barRef.current);
      }
    };
    const onWheel = () => {
      if (shouldBlockHideForSearch() || !interactionLockRef.current) return;
      blurSearchFieldInBar(barRef.current);
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("wheel", onWheel, { passive: true });

    const viewport = window.visualViewport;
    const onViewportChange = () => {
      lastScrollY.current = window.scrollY;
      if (shouldBlockHideForSearch() || interactionLockRef.current) setHidden(false);
    };
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("wheel", onWheel);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [anchorRef, barRef, options?.keepVisible, options?.suppressHideRef]);

  useEffect(() => {
    if (options?.keepVisible) setHidden(false);
  }, [options?.keepVisible]);

  return { pinned, hidden, placeholderHeight };
}