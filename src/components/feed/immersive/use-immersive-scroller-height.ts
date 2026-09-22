"use client";

import { useLayoutEffect, type RefObject } from "react";

/** Pin slide height to the scrollport’s pixel height so overlays stay above the glass nav. */
export function useImmersiveScrollerHeight(scrollerRef: RefObject<HTMLDivElement | null>) {
  useLayoutEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    const mq = window.matchMedia("(max-width: 1023px)");
    if (!mq.matches) return;

    const apply = () => {
      if (!mq.matches) {
        el.style.removeProperty("--immersive-slide-h");
        return;
      }
      const h = el.clientHeight;
      if (h > 64) {
        el.style.setProperty("--immersive-slide-h", `${h}px`);
      }
    };

    apply();
    const raf = requestAnimationFrame(apply);

    const ro = new ResizeObserver(() => apply());
    ro.observe(el);
    const column = el.closest(".immersive-feed-column");
    if (column instanceof HTMLElement) ro.observe(column);
    const root = el.closest(".immersive-feed-root");
    if (root instanceof HTMLElement) ro.observe(root);

    const vv = window.visualViewport;
    const onViewport = () => requestAnimationFrame(apply);
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    window.addEventListener("orientationchange", onViewport);
    mq.addEventListener("change", apply);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      window.removeEventListener("orientationchange", onViewport);
      mq.removeEventListener("change", apply);
      el.style.removeProperty("--immersive-slide-h");
    };
  }, [scrollerRef]);
}
