"use client";

import { useLayoutEffect, type RefObject } from "react";
import {
  findMobileTabNav,
  measureCreateFlowHeightPx,
} from "@/lib/immersive-scroller-height";

const MOBILE_MQ = "(max-width: 1023px)";
const MIN_CREATE_H = 120;

/** Re-measure create column height when visualViewport changes (PWA resume, keyboard, rotate). */
export function useCreateFlowViewportHeight(rootRef: RefObject<HTMLElement | null>) {
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mq = window.matchMedia(MOBILE_MQ);

    const apply = () => {
      if (!mq.matches) {
        root.style.removeProperty("--create-flow-h");
        return;
      }
      const h = measureCreateFlowHeightPx(root);
      if (h > MIN_CREATE_H) {
        root.style.setProperty("--create-flow-h", `${h}px`);
      }
    };

    const rafIds: number[] = [];
    const scheduleBurst = () => {
      for (let i = 0; i < 4; i++) {
        rafIds.push(requestAnimationFrame(() => apply()));
      }
    };

    apply();
    scheduleBurst();

    const timeoutIds = [
      window.setTimeout(apply, 0),
      window.setTimeout(apply, 50),
      window.setTimeout(apply, 150),
      window.setTimeout(apply, 400),
    ];

    const ro = new ResizeObserver(() => apply());
    ro.observe(root);
    for (const selector of [".app-main-slot", "main", ".app-shell-viewport-lock"]) {
      const node = root.closest(selector);
      if (node instanceof HTMLElement) ro.observe(node);
    }
    const shell = root.closest(".app-shell-viewport-lock");
    const nav = findMobileTabNav(shell);
    if (nav) ro.observe(nav);

    const vv = window.visualViewport;
    const onViewport = () => scheduleBurst();
    vv?.addEventListener("resize", onViewport);
    vv?.addEventListener("scroll", onViewport);
    window.addEventListener("orientationchange", onViewport);
    window.addEventListener("resize", onViewport);

    const onVisibility = () => {
      if (document.visibilityState === "visible") scheduleBurst();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", onViewport);

    mq.addEventListener("change", apply);

    return () => {
      for (const id of rafIds) cancelAnimationFrame(id);
      for (const id of timeoutIds) window.clearTimeout(id);
      ro.disconnect();
      vv?.removeEventListener("resize", onViewport);
      vv?.removeEventListener("scroll", onViewport);
      window.removeEventListener("orientationchange", onViewport);
      window.removeEventListener("resize", onViewport);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", onViewport);
      mq.removeEventListener("change", apply);
      root.style.removeProperty("--create-flow-h");
    };
  }, [rootRef]);
}
