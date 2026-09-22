"use client";

import { useEffect, useState } from "react";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";

export function useVideoSoundLibrary() {
  const [tracks, setTracks] = useState<VideoSoundTrackClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/install-video/sounds", { cache: "no-store" });
        if (!res.ok) throw new Error("Could not load sounds");
        const data = (await res.json()) as { tracks: VideoSoundTrackClient[] };
        if (!cancelled) {
          setTracks(data.tracks ?? []);
          setError(null);
        }
      } catch {
        if (!cancelled) {
          setTracks([]);
          setError("Sounds unavailable");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return { tracks, loading, error };
}
