"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Images, Pause, Play, Volume2, VolumeX } from "lucide-react";
import { baseVideoUrl } from "@/lib/media";
import { cn } from "@/lib/utils";
import { parseVideoCompilationOptions } from "@/lib/video-compilation/options";
import { previewUrlForTrack } from "@/lib/video-compilation/sound-tracks";
import { useVideoSoundLibrary } from "@/hooks/use-video-sound-library";
import { ImmersiveInstallPhotoInspect } from "@/components/feed/immersive/immersive-install-photo-inspect";

interface ImmersiveCompiledInstallVideoProps {
  videoUrl: string;
  posterUrl?: string | null;
  sourcePhotoUrls: string[];
  videoCompilationOptions: unknown;
  active: boolean;
  className?: string;
}

export function ImmersiveCompiledInstallVideo({
  videoUrl,
  posterUrl,
  sourcePhotoUrls,
  videoCompilationOptions,
  active,
  className,
}: ImmersiveCompiledInstallVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { tracks } = useVideoSoundLibrary();

  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks]);
  const compilation = useMemo(
    () => parseVideoCompilationOptions(videoCompilationOptions, trackIds),
    [videoCompilationOptions, trackIds]
  );

  const track = compilation.audio === "none" ? null : tracks.find((t) => t.id === compilation.audio) ?? null;
  const audioSrc = previewUrlForTrack(track);
  const splitAudio = Boolean(audioSrc);

  const [videoPlaying, setVideoPlaying] = useState(false);
  const [audioMuted, setAudioMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [inspectOpen, setInspectOpen] = useState(false);

  const pauseVideoOnly = useCallback(() => {
    videoRef.current?.pause();
    setVideoPlaying(false);
  }, []);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      await video.play();
      setVideoPlaying(true);
    } catch {
      setVideoPlaying(false);
    }
  }, []);

  const playBoth = useCallback(async () => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;
    try {
      if (splitAudio && audio && audioSrc) {
        if (audio.paused) await audio.play();
      } else {
        video.muted = audioMuted;
      }
      await video.play();
      setVideoPlaying(true);
    } catch {
      setVideoPlaying(false);
    }
  }, [audioMuted, audioSrc, splitAudio]);

  const pauseAll = useCallback(() => {
    videoRef.current?.pause();
    audioRef.current?.pause();
    setVideoPlaying(false);
  }, []);

  const togglePlay = useCallback(() => {
    if (inspectOpen) return;
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void playBoth();
    else if (splitAudio) pauseVideoOnly();
    else {
      video.pause();
      setVideoPlaying(false);
    }
  }, [inspectOpen, pauseVideoOnly, playBoth, splitAudio]);

  const openInspect = useCallback(() => {
    pauseVideoOnly();
    setInspectOpen(true);
  }, [pauseVideoOnly]);

  const closeInspect = useCallback(() => {
    setInspectOpen(false);
    if (active) void playVideo();
  }, [active, playVideo]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video) return;

    if (!active) {
      pauseAll();
      setInspectOpen(false);
      return;
    }

    video.muted = splitAudio || audioMuted;

    const start = async () => {
      try {
        if (splitAudio && audio && audioSrc) {
          audio.muted = audioMuted;
          if (audio.paused) await audio.play();
          video.muted = true;
          await video.play();
          setVideoPlaying(true);
          return;
        }
        video.muted = audioMuted;
        await video.play();
        setVideoPlaying(true);
      } catch {
        if (splitAudio) {
          video.muted = true;
          setAudioMuted(true);
          try {
            await video.play();
            setVideoPlaying(true);
          } catch {
            setVideoPlaying(false);
          }
        } else {
          setVideoPlaying(false);
        }
      }
    };

    void start();
  }, [active, audioMuted, audioSrc, pauseAll, splitAudio, videoUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    audio.muted = audioMuted;
  }, [audioMuted, audioSrc]);

  useEffect(() => {
    if (!splitAudio || !audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;

    const onEnded = () => {
      pauseVideoOnly();
    };

    audio.addEventListener("ended", onEnded);
    return () => audio.removeEventListener("ended", onEnded);
  }, [audioSrc, pauseVideoOnly, splitAudio]);

  const toggleMute = useCallback(() => {
    setAudioMuted((m) => {
      const next = !m;
      const video = videoRef.current;
      const audio = audioRef.current;
      if (splitAudio) {
        if (audio) audio.muted = next;
        if (video) video.muted = true;
      } else if (video) {
        video.muted = next;
      }
      return next;
    });
  }, [splitAudio]);

  const showPhotos = sourcePhotoUrls.length > 0;

  return (
    <div className={cn("relative h-full w-full bg-black", className)}>
      <video
        ref={videoRef}
        src={baseVideoUrl(videoUrl)}
        poster={posterUrl ?? undefined}
        className="h-full w-full object-cover"
        playsInline
        loop
        muted={splitAudio || audioMuted}
        preload={active ? "auto" : "metadata"}
        onTimeUpdate={(e) => {
          const v = e.currentTarget;
          if (v.duration) setProgress(v.currentTime / v.duration);
        }}
        onClick={togglePlay}
        onPlay={() => setVideoPlaying(true)}
        onPause={() => {
          const audio = audioRef.current;
          if (splitAudio && audio && audioSrc && !audio.paused && !audio.ended) {
            setVideoPlaying(false);
            return;
          }
          setVideoPlaying(false);
        }}
      />

      {audioSrc ? <audio ref={audioRef} src={audioSrc} preload="auto" className="hidden" /> : null}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-white/20">
        <div
          className="h-full bg-cyan-400/90 transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </div>

      {splitAudio && !videoPlaying && !inspectOpen && (
        <div className="pointer-events-none absolute left-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full bg-black/45 px-2.5 py-1 text-[11px] text-white/90 backdrop-blur-sm">
          Music keeps playing
        </div>
      )}

      <div className="absolute left-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
        {showPhotos && (
          <button
            type="button"
            onClick={openInspect}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
            aria-label="View install photos"
          >
            <Images className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className="absolute right-3 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label={videoPlaying ? "Pause video" : "Play video"}
        >
          {videoPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 pl-0.5" />}
        </button>
        <button
          type="button"
          onClick={toggleMute}
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm"
          aria-label={audioMuted ? "Unmute" : "Mute"}
        >
          {audioMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>

      <ImmersiveInstallPhotoInspect
        urls={sourcePhotoUrls}
        open={inspectOpen}
        onClose={closeInspect}
      />
    </div>
  );
}
