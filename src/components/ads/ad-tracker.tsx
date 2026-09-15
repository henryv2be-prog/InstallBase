"use client";

import { useEffect, useRef } from "react";
import { getDeviceType, getOrCreateViewerKey } from "@/lib/advertising/viewer-key";

interface AdTrackerProps {
  advertisementId: string;
  placementKey: string;
}

export function AdImpressionTracker({ advertisementId, placementKey }: AdTrackerProps) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    const payload = {
      advertisementId,
      placementKey,
      viewerKey: getOrCreateViewerKey(),
      deviceType: getDeviceType(),
    };

    fetch("/api/ads/impression", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => undefined);
  }, [advertisementId, placementKey]);

  return null;
}

export async function trackAdClick(advertisementId: string, placementKey: string) {
  await fetch("/api/ads/click", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      advertisementId,
      placementKey,
      viewerKey: getOrCreateViewerKey(),
      deviceType: getDeviceType(),
    }),
    keepalive: true,
  }).catch(() => undefined);
}
