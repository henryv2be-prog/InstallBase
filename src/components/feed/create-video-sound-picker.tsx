"use client";

import { Loader2, VolumeX } from "lucide-react";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import { cn } from "@/lib/utils";

interface CreateVideoSoundPickerProps {
  value: VideoCompilationAudioSelection;
  onChange: (audio: VideoCompilationAudioSelection) => void;
  tracks: VideoSoundTrackClient[];
  loading?: boolean;
  disabled?: boolean;
  /** Compact row for preview step — selection triggers parent preview, no separate play buttons. */
  variant?: "preview";
}

export function CreateVideoSoundPicker({
  value,
  onChange,
  tracks,
  loading,
  disabled,
}: CreateVideoSoundPickerProps) {
  return (
    <div className="rounded-xl border border-border bg-card/40 p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-foreground">Choose a sound</p>
          <p className="mt-0.5 text-xs text-muted">Scroll and tap — the player above updates right away.</p>
        </div>
        {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" aria-hidden />}
      </div>

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
        <SoundChip
          active={value === "none"}
          label="Original"
          sub="No music"
          disabled={disabled}
          onClick={() => onChange("none")}
          icon={<VolumeX className="h-5 w-5 text-muted" />}
        />
        {tracks.map((track) => (
          <SoundChip
            key={track.id}
            active={value === track.id}
            label={track.label}
            sub={track.tag}
            disabled={disabled}
            onClick={() => onChange(track.id)}
          />
        ))}
      </div>

      {!loading && tracks.length === 0 && (
        <p className="mt-2 text-xs text-muted">
          No music in the library yet. Add MP3s under{" "}
          <code className="rounded bg-muted/40 px-1 text-[10px]">public/audio/video-compilation/</code> and redeploy.
        </p>
      )}
    </div>
  );
}

function SoundChip({
  active,
  label,
  sub,
  disabled,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  sub: string;
  disabled?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-[4.25rem] min-w-[7.25rem] max-w-[9rem] shrink-0 snap-start flex-col justify-center rounded-2xl border px-3 py-2 text-left transition-all touch-manipulation",
        active
          ? "scale-[1.02] border-primary bg-primary/15 ring-2 ring-primary/40 shadow-sm"
          : "border-border bg-card/60 active:scale-[0.98]",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {icon ? <span className="mb-1">{icon}</span> : null}
      <span className="line-clamp-2 text-xs font-semibold leading-tight text-foreground">{label}</span>
      <span className="mt-0.5 text-[10px] text-muted">{sub}</span>
    </button>
  );
}
