"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const HEADER_OFFSET_PX = 52;
const SCROLL_DELTA_HIDE = 18;
const SCROLL_TOP_REVEAL = 48;

type PinState = {
  pinned: boolean;
  hidden: boolean;
  placeholderHeight: number;
};

type PinOptions = {
  /** When true, keep the pinned bar visible (e.g. during programmatic scroll-to-results). */
  suppressHideRef?: RefObject<boolean>;
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

    const isSearchQueryTarget = (node: EventTarget | null) =>
      node instanceof HTMLInputElement && node.classList.contains("kf-search-input");

    const onFocusIn = (event: FocusEvent) => {
      if (!isSearchQueryTarget(event.target)) return;
      interactionLockRef.current = true;
      setHidden(false);
    };

    const onFocusOut = (event: FocusEvent) => {
      if (!isSearchQueryTarget(event.target)) return;
      const next = event.relatedTarget;
      if (!isSearchQueryTarget(next)) {
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

  const isHideSuppressed = () => Boolean(options?.suppressHideRef?.current);

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

      if (isHideSuppressed()) {
        setHidden(false);
        lastScrollY.current = y;
        return;
      }

      if (y < SCROLL_TOP_REVEAL) {
        setHidden(false);
      } else if (isPinned) {
        const delta = y - lastScrollY.current;
        if (delta > SCROLL_DELTA_HIDE) {
          if (!interactionLockRef.current) setHidden(true);
        } else if (delta < -SCROLL_DELTA_HIDE) {
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

    const viewport = window.visualViewport;
    const onViewportChange = () => {
      lastScrollY.current = window.scrollY;
      if (isHideSuppressed() || interactionLockRef.current) setHidden(false);
    };
    viewport?.addEventListener("resize", onViewportChange);
    viewport?.addEventListener("scroll", onViewportChange);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      viewport?.removeEventListener("resize", onViewportChange);
      viewport?.removeEventListener("scroll", onViewportChange);
    };
  }, [anchorRef, barRef, options?.suppressHideRef]);

  return { pinned, hidden, placeholderHeight };
}