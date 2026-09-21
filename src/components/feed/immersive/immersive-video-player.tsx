"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { baseVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";

interface ImmersiveVideoPlayerProps {
  url: string;
  posterUrl?: string | null;
  active: boolean;
  className?: string;
}

export function ImmersiveVideoPlayer({ url, posterUrl, active, className }: ImmersiveVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (active) {
      video.muted = muted;
      void video.play().then(() => setPlaying(true)).catch(() => setPlaying(false));
    } else {
      video.pause();
      setPlaying(false);
    }
  }, [active, muted, url]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = muted;
  }, [muted]);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
      setPlaying(true);
    } else {
      video.pause();
      setPlaying(false);
    }
  }, []);

  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <video
        ref={videoRef}
        src={baseVideoUrl(url)}
        poster={posterUrl ?? undefined}
        className="h-full w-full object-cover"
        playsInline
        loop
        preload={active ? "auto" : "metadata"}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
        onClick={togglePlay}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/20">
        <div className="h-full bg-cyan-400/90 transition-[width] duration-150" style={{ width: `${progress * 100}%` }} />
      </div>

      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label={playing ? "Pause" : "Play"}
        >
          {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
        </button>
        <button
          type="button"
          onClick={() => setMuted((m) => !m)}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
