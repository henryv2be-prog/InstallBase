"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { formatVideoDuration, videoPreviewSrc } from "@/lib/media";
import { cn } from "@/lib/utils";

interface VideoFeedPreviewProps {
  url: string;
  className?: string;
}

/** Paused first-frame preview for feed tiles — full playback opens in the lightbox. */
export function VideoFeedPreview({ url, className }: VideoFeedPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const pauseOnFrame = () => {
      try {
        if (video.currentTime < 0.05) video.currentTime = 0.1;
      } catch {
        /* ignore seek errors on unsupported sources */
      }
      video.pause();
      setReady(true);
    };

    const onLoadedMetadata = () => {
      const label = formatVideoDuration(video.duration);
      if (label) setDurationLabel(label);
      pauseOnFrame();
    };

    video.addEventListener("loadeddata", pauseOnFrame);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadeddata", pauseOnFrame);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [url]);

  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <video
        ref={videoRef}
        src={videoPreviewSrc(url)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-200",
          ready ? "opacity-100" : "opacity-0"
        )}
        muted
        playsInline
        preload="metadata"
        disablePictureInPicture
        aria-hidden="true"
        tabIndex={-1}
      />
      {!ready && <div className="absolute inset-0 animate-pulse bg-gray-800" />}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </div>
      </div>
      {durationLabel && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {durationLabel}
        </span>
      )}
    </div>
  );
}
