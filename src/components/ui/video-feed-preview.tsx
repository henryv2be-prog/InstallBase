"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Play } from "lucide-react";
import { baseVideoUrl, formatVideoDuration } from "@/lib/media";
import {
  claimVideoPreview,
  registerVideoPreview,
  releaseVideoPreview,
} from "@/lib/video-preview-manager";
import { cn } from "@/lib/utils";

/** Roughly two feed cards ahead + behind for attach; delayed unload when scrolled away. */
const VIDEO_ATTACH_ROOT_MARGIN = "560px 0px 360px 0px";
const VIDEO_UNLOAD_DELAY_MS = 3000;
const VIDEO_PLAY_VISIBLE_RATIO = 0.35;

interface VideoFeedPreviewProps {
  url: string;
  className?: string;
}

function waitForVideoReady(video: HTMLVideoElement, timeoutMs = 4000) {
  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const onReady = () => {
      cleanup();
      resolve();
    };
    const onError = () => {
      cleanup();
      reject(new Error("Video failed to load"));
    };
    const timer = window.setTimeout(() => {
      cleanup();
      reject(new Error("Video load timed out"));
    }, timeoutMs);

    const cleanup = () => {
      video.removeEventListener("loadeddata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onError);
      window.clearTimeout(timer);
    };

    video.addEventListener("loadeddata", onReady, { once: true });
    video.addEventListener("canplay", onReady, { once: true });
    video.addEventListener("error", onError, { once: true });
  });
}

/** Paused first-frame preview in the feed; muted playback on hover (desktop) or when in view (mobile). */
export function VideoFeedPreview({ url, className }: VideoFeedPreviewProps) {
  const previewId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewingRef = useRef(false);
  const unloadTimerRef = useRef<number | null>(null);

  const [nearViewport, setNearViewport] = useState(false);
  const [durationLabel, setDurationLabel] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [canHoverPreview, setCanHoverPreview] = useState(false);
  const [motionPreviewEnabled, setMotionPreviewEnabled] = useState(true);

  const clearUnloadTimer = useCallback(() => {
    if (unloadTimerRef.current) {
      window.clearTimeout(unloadTimerRef.current);
      unloadTimerRef.current = null;
    }
  }, []);

  const unloadVideo = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    clearUnloadTimer();
    video.pause();
    if (video.src) {
      video.removeAttribute("src");
      video.load();
    }
    previewingRef.current = false;
    setPreviewing(false);
    setReady(false);
    setDurationLabel(null);
    releaseVideoPreview(previewId);
  }, [clearUnloadTimer, previewId]);

  const showPosterFrame = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.src) return;

    video.pause();
    try {
      video.currentTime = 0.1;
    } catch {
      /* ignore seek errors */
    }
    previewingRef.current = false;
    setPreviewing(false);
    setReady(true);
    releaseVideoPreview(previewId);
  }, [previewId]);

  const startPreview = useCallback(async () => {
    const video = videoRef.current;
    if (!video?.src || previewingRef.current) return;

    video.muted = true;
    video.loop = true;

    try {
      await waitForVideoReady(video);
      claimVideoPreview(previewId);
      await video.play();
      previewingRef.current = true;
      setPreviewing(true);
    } catch {
      showPosterFrame();
    }
  }, [previewId, showPosterFrame]);

  useEffect(() => {
    const pause = () => showPosterFrame();
    return registerVideoPreview(previewId, pause);
  }, [previewId, showPosterFrame]);

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
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearUnloadTimer();
          setNearViewport(true);
          return;
        }

        if (entry.intersectionRatio === 0) {
          clearUnloadTimer();
          unloadTimerRef.current = window.setTimeout(() => {
            setNearViewport(false);
            unloadVideo();
          }, VIDEO_UNLOAD_DELAY_MS);
        }
      },
      { rootMargin: VIDEO_ATTACH_ROOT_MARGIN, threshold: [0, 0.01] }
    );

    observer.observe(container);
    return () => {
      clearUnloadTimer();
      observer.disconnect();
    };
  }, [clearUnloadTimer, unloadVideo]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!nearViewport) return;

    previewingRef.current = false;
    setPreviewing(false);
    setReady(false);

    const onLoadedMetadata = () => {
      const label = formatVideoDuration(video.duration);
      if (label) setDurationLabel(label);
      showPosterFrame();
    };

    video.src = baseVideoUrl(url);
    video.preload = "metadata";
    video.load();
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    return () => {
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.pause();
    };
  }, [nearViewport, showPosterFrame, url]);

  useEffect(() => {
    if (!nearViewport || canHoverPreview || !motionPreviewEnabled) return;

    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && entry.intersectionRatio >= VIDEO_PLAY_VISIBLE_RATIO) {
          void startPreview();
        } else {
          showPosterFrame();
        }
      },
      { threshold: [0, VIDEO_PLAY_VISIBLE_RATIO, 0.75] }
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [canHoverPreview, motionPreviewEnabled, nearViewport, showPosterFrame, startPreview]);

  const handlePointerEnter = () => {
    if (!canHoverPreview || !nearViewport) return;
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
        preload="none"
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
