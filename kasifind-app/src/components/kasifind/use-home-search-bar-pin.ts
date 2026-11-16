"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

const HEADER_OFFSET_PX = 52;
const SCROLL_DELTA_HIDE = 12;
const SCROLL_TOP_REVEAL = 48;

type PinState = {
  pinned: boolean;
  hidden: boolean;
  placeholderHeight: number;
};

export function useHomeSearchBarPin(
  anchorRef: RefObject<HTMLElement | null>,
  barRef: RefObject<HTMLElement | null>
): PinState {
  const [pinned, setPinned] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [placeholderHeight, setPlaceholderHeight] = useState(0);
  const lastScrollY = useRef(0);
  const pinStartY = useRef<number | null>(null);

  useEffect(() => {
    const measureBar = () => {
      if (barRef.current) setPlaceholderHeight(barRef.current.offsetHeight);
    };
    measureBar();
    window.addEventListener("resize", measureBar);
    return () => window.removeEventListener("resize", measureBar);
  }, [barRef]);

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

      if (y < SCROLL_TOP_REVEAL) {
        setHidden(false);
      } else if (isPinned) {
        const delta = y - lastScrollY.current;
        if (delta > SCROLL_DELTA_HIDE) setHidden(true);
        else if (delta < -SCROLL_DELTA_HIDE) setHidden(false);
      } else {
        setHidden(false);
      }

      lastScrollY.current = y;
    };

    resolvePinStart();
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", () => {
      pinStartY.current = null;
      resolvePinStart();
      onScroll();
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [anchorRef, barRef]);

  return { pinned, hidden, placeholderHeight };
}