"use client";

import { useEffect, useState } from "react";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";

type SoundLibrarySnapshot = {
  tracks: VideoSoundTrackClient[];
  error: string | null;
  loading: boolean;
};

let sharedSnapshot: SoundLibrarySnapshot = {
  tracks: [],
  error: null,
  loading: true,
};

let inflight: Promise<void> | null = null;
const listeners = new Set<(snapshot: SoundLibrarySnapshot) => void>();

function notify() {
  for (const listener of listeners) listener(sharedSnapshot);
}

async function loadSoundLibraryOnce() {
  if (inflight) return inflight;

  inflight = (async () => {
    sharedSnapshot = { ...sharedSnapshot, loading: true };
    notify();
    try {
      const res = await fetch("/api/install-video/sounds", { cache: "force-cache" });
      if (!res.ok) throw new Error("Could not load sounds");
      const data = (await res.json()) as { tracks: VideoSoundTrackClient[] };
      sharedSnapshot = {
        tracks: data.tracks ?? [],
        error: null,
        loading: false,
      };
    } catch {
      sharedSnapshot = {
        tracks: [],
        error: "Sounds unavailable",
        loading: false,
      };
    } finally {
      inflight = null;
      notify();
    }
  })();

  return inflight;
}

/** One shared fetch for the whole app — immersive feed mounts many slides. */
export function useVideoSoundLibrary() {
  const [snapshot, setSnapshot] = useState<SoundLibrarySnapshot>(sharedSnapshot);

  useEffect(() => {
    const onUpdate = (next: SoundLibrarySnapshot) => setSnapshot(next);
    listeners.add(onUpdate);
    void loadSoundLibraryOnce();
    return () => {
      listeners.delete(onUpdate);
    };
  }, []);

  return {
    tracks: snapshot.tracks,
    loading: snapshot.loading,
    error: snapshot.error,
  };
}
