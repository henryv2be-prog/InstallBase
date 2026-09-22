"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Music2, Pause, Play, VolumeX } from "lucide-react";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import { previewUrlForTrack, type VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import { cn } from "@/lib/utils";

interface CreateVideoSoundPickerProps {
  value: VideoCompilationAudioSelection;
  onChange: (audio: VideoCompilationAudioSelection) => void;
  tracks: VideoSoundTrackClient[];
  loading?: boolean;
  disabled?: boolean;
}

export function CreateVideoSoundPicker({
  value,
  onChange,
  tracks,
  loading,
  disabled,
}: CreateVideoSoundPickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<string | null>(null);

  const stopPreview = useCallback(() => {
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.currentTime = 0;
    }
    setPreviewing(null);
  }, []);

  useEffect(() => {
    return () => stopPreview();
  }, [stopPreview]);

  const togglePreview = (track: VideoSoundTrackClient, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled) return;

    if (previewing === track.id) {
      stopPreview();
      return;
    }

    stopPreview();
    const url = previewUrlForTrack(track);
    if (!url) return;

    const el = audioRef.current ?? new Audio();
    audioRef.current = el;
    el.src = url;
    el.volume = 0.85;
    el.currentTime = 0;
    void el
      .play()
      .then(() => setPreviewing(track.id))
      .catch(() => setPreviewing(null));
    el.onended = () => setPreviewing(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Music2 className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Add sound</p>
        {loading && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted" aria-hidden />}
      </div>
      <p className="mt-0.5 text-xs text-muted">
        Drop MP3s in{" "}
        <code className="rounded bg-muted/40 px-1 py-0.5 text-[10px]">public/audio/video-compilation/</code>{" "}
        on GitHub — they appear here after deploy. Tap play to preview.
      </p>
      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto pb-1 px-1 snap-x snap-mandatory">
        <div
          className={cn(
            "relative flex w-[7.5rem] shrink-0 snap-start flex-col rounded-2xl border p-3",
            value === "none"
              ? "border-primary bg-primary/10 ring-2 ring-primary/40"
              : "border-border bg-card/50"
          )}
        >
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              stopPreview();
              onChange("none");
            }}
            className="flex w-full flex-col text-left"
          >
            <div className="mb-2 flex h-14 w-full items-center justify-center rounded-xl bg-muted/30">
              <VolumeX className="h-6 w-6 text-muted" aria-hidden />
            </div>
            <span className="text-xs font-semibold text-foreground">Original</span>
            <span className="text-[10px] text-muted">No music</span>
          </button>
        </div>

        {tracks.map((track) => {
          const active = value === track.id;
          const isPlaying = previewing === track.id;
          return (
            <div
              key={track.id}
              className={cn(
                "relative flex w-[7.5rem] shrink-0 snap-start flex-col rounded-2xl border p-3",
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                  : "border-border bg-card/50 hover:border-primary/35"
              )}
            >
              <button
                type="button"
                disabled={disabled}
                onClick={(e) => togglePreview(track, e)}
                className="absolute right-2 top-2 z-10 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/70"
                aria-label={isPlaying ? "Pause preview" : "Play preview"}
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </button>
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  stopPreview();
                  onChange(track.id);
                }}
                className="flex w-full flex-col text-left"
              >
                <div className="mb-2 flex h-14 w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary/25 to-violet-500/20">
                  <span className="line-clamp-2 px-1 text-center text-[11px] font-bold leading-tight text-foreground/90">
                    {track.tag}
                  </span>
                </div>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                  {track.label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
      {!loading && tracks.length === 0 && (
        <p className="mt-2 text-xs text-muted">
          No music files yet. Upload <strong>.mp3</strong> files to the folder above and redeploy.
        </p>
      )}
    </div>
  );
}
