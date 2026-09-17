"use client";

import { useEffect, useRef } from "react";
import { getDeviceType, getOrCreateViewerKey } from "@/lib/advertising/viewer-key";

interface PageViewTrackerProps {
  pageKey: string;
}

export function PageViewTracker({ pageKey }: PageViewTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    fetch("/api/analytics/page-view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pageKey,
        viewerKey: getOrCreateViewerKey(),
        deviceType: getDeviceType(),
      }),
      keepalive: true,
    }).catch(() => undefined);
  }, [pageKey]);

  return null;
}
