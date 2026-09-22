"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Pause, Play, Volume2, VolumeX } from "lucide-react";
import { cn } from "@/lib/utils";
import { baseVideoUrl } from "@/lib/media";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import { previewUrlForTrack, type VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";

interface VideoWithMusicPreviewProps {
  videoUrl: string;
  posterUrl?: string | null;
  audioId: VideoCompilationAudioSelection;
  tracks: VideoSoundTrackClient[];
  className?: string;
}

export function VideoWithMusicPreview({
  videoUrl,
  posterUrl,
  audioId,
  tracks,
  className,
}: VideoWithMusicPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);

  const track = audioId === "none" ? null : tracks.find((t) => t.id === audioId) ?? null;
  const audioSrc = previewUrlForTrack(track);

  const playBoth = useCallback(async () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    try {
      if (audio && audioSrc) {
        audio.currentTime = 0;
      }
      video.currentTime = 0;
      await video.play();
      if (audio && audioSrc) {
        await audio.play();
      }
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [audioSrc]);

  const pauseBoth = useCallback(() => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (videoRef.current?.paused) void playBoth();
    else pauseBoth();
  }, [pauseBoth, playBoth]);

  useEffect(() => {
    pauseBoth();
    const video = videoRef.current;
    const audio = audioRef.current;
    if (video) video.currentTime = 0;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }, [audioSrc, pauseBoth]);

  useEffect(() => {
    pauseBoth();
    const video = videoRef.current;
    if (video) video.currentTime = 0;
  }, [videoUrl, pauseBoth]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;

    const onEnded = () => {
      const video = videoRef.current;
      video?.pause();
      if (video) video.currentTime = 0;
      setPlaying(false);
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [audioSrc]);

  useEffect(() => {
    if (!audioSrc) return;
    const timer = window.setTimeout(() => void playBoth(), 120);
    return () => {
      window.clearTimeout(timer);
      pauseBoth();
    };
  }, [audioSrc, playBoth, pauseBoth]);

  return (
    <div className={cn("relative mx-auto w-full max-w-md", className)}>
      <div className="relative aspect-[9/16] overflow-hidden rounded-2xl bg-black shadow-lg ring-1 ring-border/50">
        <video
          ref={videoRef}
          key={videoUrl}
          src={baseVideoUrl(videoUrl)}
          poster={posterUrl ?? undefined}
          className="h-full w-full object-cover"
          playsInline
          muted
          loop
          preload="auto"
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => {
            const audio = audioRef.current;
            if (audio && audioSrc && !audio.paused && !audio.ended) return;
            setPlaying(false);
          }}
        />
        {audioSrc ? (
          <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" />
        ) : null}

        <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-between bg-gradient-to-b from-black/60 to-transparent p-3">
          <span className="rounded-full bg-black/45 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
            Feed preview
          </span>
          <span className="flex items-center gap-1 rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white backdrop-blur-sm">
            {audioSrc ? (
              <>
                <Volume2 className="h-3 w-3" aria-hidden />
                {track?.label ?? "Music"}
              </>
            ) : (
              <>
                <VolumeX className="h-3 w-3" aria-hidden />
                Original
              </>
            )}
          </span>
        </div>

        <button
          type="button"
          onClick={togglePlay}
          className="absolute bottom-4 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-full bg-white/25 text-white backdrop-blur-md transition hover:bg-white/35"
          aria-label={playing ? "Pause preview" : "Play preview"}
        >
          {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 pl-0.5" />}
        </button>
      </div>
      <p className="mt-2 text-center text-xs text-muted">
        Photos loop while the track plays — same as your posted video. Tap to play or pause.
      </p>
    </div>
  );
}
