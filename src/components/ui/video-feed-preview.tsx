"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";
import { baseVideoUrl, formatVideoDuration } from "@/lib/media";
import { cn } from "@/lib/utils";

interface VideoFeedPreviewProps {
  url: string;
  className?: string;
}

/** Paused first-frame preview in the feed; muted playback on hover (desktop) or when in view (mobile). */
export function VideoFeedPreview({ url, className }: VideoFeedPreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewingRef = useRef(false);

  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [canHoverPreview, setCanHoverPreview] = useState(false);
  const [motionPreviewEnabled, setMotionPreviewEnabled] = useState(true);

  const showPosterFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.pause();
    try {
      video.currentTime = 0.1;
    } catch {
      /* ignore seek errors */
    }
    previewingRef.current = false;
    setPreviewing(false);
    setReady(true);
  }, []);

  const startPreview = useCallback(async () => {
    const video = videoRef.current;
    if (!video || previewingRef.current) return;

    video.muted = true;
    video.loop = true;

    try {
      await video.play();
      previewingRef.current = true;
      setPreviewing(true);
    } catch {
      showPosterFrame();
    }
  }, [showPosterFrame]);

  useEffect(() => {
    const hoverQuery = window.matchMedia("(hover: hover) and (pointer: fine)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateHoverSupport = () => {
      const reducedMotion = motionQuery.matches;
      setMotionPreviewEnabled(!reducedMotion);
      setCanHoverPreview(hoverQuery.matches && !reducedMotion);
    };

    updateHoverSupport();
    hoverQuery.addEventListener("change", updateHoverSupport);
    motionQuery.addEventListener("change", updateHoverSupport);

    return () => {
      hoverQuery.removeEventListener("change", updateHoverSupport);
      motionQuery.removeEventListener("change", updateHoverSupport);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    previewingRef.current = false;
    setPreviewing(false);
    setReady(false);

    const onLoadedMetadata = () => {
      const label = formatVideoDuration(video.duration);
      if (label) setDurationLabel(label);
      showPosterFrame();
    };

    video.src = baseVideoUrl(url);
    video.load();
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.pause();
    };
  }, [showPosterFrame, url]);

  useEffect(() => {
    if (canHoverPreview || !motionPreviewEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
          void startPreview();
        } else {
          showPosterFrame();
        }
      },
      { threshold: [0, 0.55, 0.9] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [canHoverPreview, motionPreviewEnabled, showPosterFrame, startPreview]);

  const handlePointerEnter = () => {
    if (!canHoverPreview) return;
    void startPreview();
  };

  const handlePointerLeave = () => {
    if (!canHoverPreview) return;
    showPosterFrame();
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative h-full w-full bg-black", className)}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <video
        ref={videoRef}
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
      <div
        className={cn(
          "pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent transition-opacity duration-200",
          previewing && "opacity-40"
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute inset-0 flex items-center justify-center transition-opacity duration-200",
          previewing ? "opacity-0" : "opacity-100"
        )}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-black/55 text-white shadow-lg ring-1 ring-white/20 backdrop-blur-sm">
          <Play className="ml-0.5 h-5 w-5 fill-current" />
        </div>
      </div>
      {durationLabel && !previewing && (
        <span className="pointer-events-none absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-[11px] font-medium text-white">
          {durationLabel}
        </span>
      )}
    </div>
  );
}
