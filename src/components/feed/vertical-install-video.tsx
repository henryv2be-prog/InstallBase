"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { baseVideoUrl } from "@/lib/media";

interface VerticalInstallVideoProps {
  url: string;
  posterUrl?: string | null;
  className?: string;
  /** Feed cards autoplay when in view; preview step uses manual controls only. */
  autoPlayInView?: boolean;
}

export function VerticalInstallVideo({
  url,
  posterUrl,
  className,
  autoPlayInView = false,
}: VerticalInstallVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

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

  const restart = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = 0;
    void video.play();
    setPlaying(true);
  }, []);

  useEffect(() => {
    if (!autoPlayInView) return;
    const root = videoRef.current?.parentElement;
    const video = videoRef.current;
    if (!root || !video) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            void video.play().catch(() => undefined);
          } else {
            video.pause();
          }
        }
      },
      { threshold: [0, 0.4, 0.75] }
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [autoPlayInView, url]);

  return (
    <div
      className={cn(
        "relative mx-auto w-full max-w-md overflow-hidden rounded-2xl bg-black shadow-lg",
        "aspect-[9/16]",
        className
      )}
    >
      <video
        ref={videoRef}
        src={baseVideoUrl(url)}
        poster={posterUrl ?? undefined}
        className="h-full w-full object-cover"
        playsInline
        muted
        loop
        preload="metadata"
        onClick={togglePlay}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
      />

      {!autoPlayInView && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center gap-3 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
          <button
            type="button"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
            onClick={togglePlay}
            aria-label={playing ? "Pause" : "Play"}
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
          </button>
          <button
            type="button"
            className="pointer-events-auto flex h-11 w-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm"
            onClick={restart}
            aria-label="Restart video"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
