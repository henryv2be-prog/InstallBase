"use client";

import {
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationAudioSelection,
  type VideoCompilationOptions,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/options";
import { CreateVideoSoundPicker } from "@/components/feed/create-video-sound-picker";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import { cn } from "@/lib/utils";

interface CreateVideoOptionsProps {
  value: VideoCompilationOptions;
  onChange: (next: VideoCompilationOptions) => void;
  tracks: VideoSoundTrackClient[];
  tracksLoading?: boolean;
  disabled?: boolean;
}

function StyleChip({
  active,
  label,
  description,
  onClick,
  disabled,
}: {
  active: boolean;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "rounded-xl border px-3 py-2 text-left transition-colors",
        active
          ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
          : "border-border bg-card/40 hover:border-primary/30 hover:bg-card/70",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      <span className="block text-sm font-medium text-foreground">{label}</span>
      <span className="mt-0.5 block text-[11px] leading-snug text-muted">{description}</span>
    </button>
  );
}

export function CreateVideoOptions({
  value,
  onChange,
  tracks,
  tracksLoading,
  disabled,
}: CreateVideoOptionsProps) {
  const setStyle = (style: VideoCompilationStyleId) => onChange({ ...value, style });
  const setAudio = (audio: VideoCompilationAudioSelection) => onChange({ ...value, audio });

  return (
    <div className="mb-4 space-y-5 rounded-xl border border-border bg-card/30 p-4">
      <CreateVideoSoundPicker
        value={value.audio}
        onChange={setAudio}
        tracks={tracks}
        loading={tracksLoading}
        disabled={disabled}
      />

      <div>
        <p className="text-sm font-semibold text-foreground">Video style</p>
        <p className="mt-0.5 text-xs text-muted">Pacing and motion between your photos.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.entries(VIDEO_COMPILATION_STYLES) as [VideoCompilationStyleId, (typeof VIDEO_COMPILATION_STYLES)[VideoCompilationStyleId]][]).map(
            ([id, meta]) => (
              <StyleChip
                key={id}
                active={value.style === id}
                label={meta.label}
                description={meta.description}
                onClick={() => setStyle(id)}
                disabled={disabled}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
