"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Music2, Pause, Play, VolumeX } from "lucide-react";
import {
  type VideoCompilationAudioId,
  VIDEO_COMPILATION_AUDIO,
} from "@/lib/video-compilation/options";
import { previewUrlForAudio, VIDEO_SOUND_TRACKS } from "@/lib/video-compilation/sound-tracks";
import { cn } from "@/lib/utils";

const ORDER: VideoCompilationAudioId[] = [
  "none",
  "down_to_business",
  "install_hype",
  "chill_vlog",
  "epic_montage",
];

interface CreateVideoSoundPickerProps {
  value: VideoCompilationAudioId;
  onChange: (audio: VideoCompilationAudioId) => void;
  disabled?: boolean;
}

export function CreateVideoSoundPicker({ value, onChange, disabled }: CreateVideoSoundPickerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [previewing, setPreviewing] = useState<VideoCompilationAudioId | null>(null);

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

  const togglePreview = (id: VideoCompilationAudioId, e: React.MouseEvent) => {
    e.stopPropagation();
    if (disabled || id === "none") return;

    if (previewing === id) {
      stopPreview();
      return;
    }

    stopPreview();
    const url = previewUrlForAudio(id);
    if (!url) return;

    const el = audioRef.current ?? new Audio();
    audioRef.current = el;
    el.src = url;
    el.volume = 0.85;
    el.currentTime = 0;
    void el.play().then(() => setPreviewing(id)).catch(() => setPreviewing(null));
    el.onended = () => setPreviewing(null);
  };

  return (
    <div>
      <div className="flex items-center gap-2">
        <Music2 className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-sm font-semibold text-foreground">Add sound</p>
      </div>
      <p className="mt-0.5 text-xs text-muted">
        TikTok-style music loops on your clip. Tap play to preview, tap the card to select.
      </p>
      <div className="mt-3 -mx-1 flex gap-2 overflow-x-auto pb-1 px-1 snap-x snap-mandatory scrollbar-thin">
        {ORDER.map((id) => {
          const active = value === id;
          const isNone = id === "none";
          const meta = isNone ? VIDEO_COMPILATION_AUDIO.none : VIDEO_SOUND_TRACKS[id];
          const label = isNone ? meta.label : meta.label;
          const tag = isNone ? "Silent" : meta.tag;
          const isPlaying = previewing === id;

          return (
            <div
              key={id}
              className={cn(
                "relative flex w-[7.5rem] shrink-0 snap-start flex-col rounded-2xl border p-3 text-left transition-colors",
                active
                  ? "border-primary bg-primary/10 ring-2 ring-primary/40"
                  : "border-border bg-card/50 hover:border-primary/35 hover:bg-card/80",
                disabled && "pointer-events-none opacity-50"
              )}
            >
              {!isNone && (
                <button
                  type="button"
                  disabled={disabled}
                  onClick={(e) => togglePreview(id, e)}
                  className="absolute right-2 top-2 z-10 rounded-full bg-black/55 p-1.5 text-white hover:bg-black/70"
                  aria-label={isPlaying ? "Pause preview" : "Play preview"}
                >
                  {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </button>
              )}
              <button
                type="button"
                disabled={disabled}
                onClick={() => {
                  stopPreview();
                  onChange(id);
                }}
                className="flex w-full flex-col text-left"
              >
                <div
                  className={cn(
                    "mb-2 flex h-14 w-full items-center justify-center rounded-xl",
                    isNone ? "bg-muted/30" : "bg-gradient-to-br from-primary/25 to-violet-500/20"
                  )}
                >
                  {isNone ? (
                    <VolumeX className="h-6 w-6 text-muted" aria-hidden />
                  ) : (
                    <span className="text-lg font-bold text-foreground/90">{tag.slice(0, 1)}</span>
                  )}
                </div>
                <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">
                  {label}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
