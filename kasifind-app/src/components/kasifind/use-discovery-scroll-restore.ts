"use client";

import { useEffect, useRef } from "react";
import {
  readDiscoveryScroll,
  scheduleDiscoveryScrollRestore,
  type DiscoveryScrollBookmark,
} from "@/lib/kasifind/discovery-scroll";

type Options = {
  ready: boolean;
  loading: boolean;
  hasSearchRun: boolean;
};

/** Applies a saved homepage scroll bookmark after search results are ready. */
export function useDiscoveryScrollRestore({ ready, loading, hasSearchRun }: Options): void {
  const bookmarkRef = useRef<DiscoveryScrollBookmark | null>(null);
  const scheduledRef = useRef(false);

  useEffect(() => {
    if (!bookmarkRef.current) bookmarkRef.current = readDiscoveryScroll();
  }, []);

  useEffect(() => {
    const bookmark = bookmarkRef.current;
    if (!bookmark || scheduledRef.current) return;
    if (!ready || loading || !hasSearchRun) return;

    scheduledRef.current = true;
    const cancel = scheduleDiscoveryScrollRestore({
      bookmark,
      isReady: () => ready && !loading && hasSearchRun,
      onRestored: () => {
        bookmarkRef.current = null;
      },
    });
    return cancel;
  }, [ready, loading, hasSearchRun]);
}