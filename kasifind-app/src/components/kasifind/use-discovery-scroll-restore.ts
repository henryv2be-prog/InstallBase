"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  clearDiscoveryScroll,
  readDiscoveryScroll,
  scheduleDiscoveryScrollRestore,
  type DiscoveryScrollBookmark,
} from "@/lib/kasifind/discovery-scroll";

type Options = {
  ready: boolean;
  loading: boolean;
  hasSearchRun: boolean;
};

type DiscoveryScrollRestore = {
  /** Drop a pending listing back-scroll and clear the stored bookmark. */
  cancelPendingRestore: () => void;
};

/** Applies a saved homepage scroll bookmark after search results are ready. */
export function useDiscoveryScrollRestore({
  ready,
  loading,
  hasSearchRun,
}: Options): DiscoveryScrollRestore {
  const bookmarkRef = useRef<DiscoveryScrollBookmark | null>(null);
  const scheduledRef = useRef(false);
  const cancelScheduledRef = useRef<(() => void) | null>(null);

  const cancelPendingRestore = useCallback(() => {
    clearDiscoveryScroll();
    bookmarkRef.current = null;
    scheduledRef.current = true;
    cancelScheduledRef.current?.();
    cancelScheduledRef.current = null;
  }, []);

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
      isReady: () => Boolean(bookmarkRef.current) && ready && !loading && hasSearchRun,
      onRestored: () => {
        bookmarkRef.current = null;
        cancelScheduledRef.current = null;
      },
    });
    cancelScheduledRef.current = cancel;
    return cancel;
  }, [ready, loading, hasSearchRun]);

  return { cancelPendingRestore };
}