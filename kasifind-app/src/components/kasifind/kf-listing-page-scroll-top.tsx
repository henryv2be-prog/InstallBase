"use client";

import { useLayoutEffect } from "react";

/**
 * Ensures public listing pages open at the top after client navigation and
 * async layout (e.g. map tiles) so the viewport is not left mid-page.
 */
export function KfListingPageScrollTop({ listingId }: { listingId: string }) {
  useLayoutEffect(() => {
    const scrollTop = () => {
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    };

    scrollTop();
    const raf = requestAnimationFrame(scrollTop);
    const afterMap = window.setTimeout(scrollTop, 400);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(afterMap);
    };
  }, [listingId]);

  return null;
}