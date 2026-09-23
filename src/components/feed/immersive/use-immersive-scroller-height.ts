"use client";

import { useLayoutEffect, type RefObject } from "react";
import {
  findMobileTabNav,
  measureImmersiveSlideHeightPx,
} from "@/lib/immersive-scroller-height";

const MOBILE_MQ = "(max-width: 1023px)";
const MIN_SLIDE_H = 64;

/** Pin slide height to the scrollport’s pixel height (full bleed under glass nav). */
export function useImmersiveScrollerHeight(scrollerRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const mq = window.matchMedia(MOBILE_MQ);
    if (!mq.matches) return;

    let lastAppliedH = 0;

    const apply = () => {
      if (!mq.matches) {
        el.style.removeProperty("--immersive-slide-h");
        return;
      }
      const h = Math.round(measureImmersiveSlideHeightPx(el));
      if (h > MIN_SLIDE_H) {
        el.style.setProperty("--immersive-slide-h", `${h}px`);
        if (Math.abs(h - lastAppliedH) > 1 && lastAppliedH > 0) {
          const idx = Math.round(el.scrollTop / lastAppliedH);
          el.scrollTop = idx * h;
        }
        lastAppliedH = h;
      }
    };

    apply();

    const rafIds: number[] = [];
    const scheduleRafBurst = () => {
      for (let i = 0; i < 4; i++) {
        rafIds.push(requestAnimationFrame(() => apply()));
      }
    };
    scheduleRafBurst();

    const timeoutIds = [
      window.setTimeout(apply, 0),
      window.setTimeout(apply, 50),
      window.setTimeout(apply, 150),
    ];

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    for (const selector of [
      ".immersive-feed-column",
      ".immersive-feed-root",
      ".immersive-viewport-page",
      ".app-main-slot",
      "main",
    ]) {
      const node = el.closest(selector);
      if (node instanceof HTMLElement) ro.observe(node);
    }
    const shell = el.closest(".app-shell-viewport-lock");
    const nav = findMobileTabNav(shell);
    if (nav) ro.observe(nav);

    const vv = window.visualViewport;
    const onViewport = () => scheduleRafBurst();
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    window.addEventListener("orientationchange", onViewport);
    window.addEventListener("load", apply);
    mq.addEventListener("change", apply);

    return () => {
      for (const id of rafIds) cancelAnimationFrame(id);
      for (const id of timeoutIds) window.clearTimeout(id);
      ro.disconnect();
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      window.removeEventListener("orientationchange", onViewport);
      window.removeEventListener("load", apply);
      mq.removeEventListener("change", apply);
      el.style.removeProperty("--immersive-slide-h");
    };
  }, [scrollerRef]);
}
