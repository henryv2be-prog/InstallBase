"use client";

import {
  VIDEO_COMPILATION_AUDIO,
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationAudioId,
  type VideoCompilationOptions,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/options";
import { cn } from "@/lib/utils";

interface CreateVideoOptionsProps {
  value: VideoCompilationOptions;
  onChange: (next: VideoCompilationOptions) => void;
  disabled?: boolean;
}

function OptionChip({
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

export function CreateVideoOptions({ value, onChange, disabled }: CreateVideoOptionsProps) {
  const setStyle = (style: VideoCompilationStyleId) => onChange({ ...value, style });
  const setAudio = (audio: VideoCompilationAudioId) => onChange({ ...value, audio });

  return (
    <div className="mb-4 space-y-4 rounded-xl border border-border bg-card/30 p-4">
      <div>
        <p className="text-sm font-semibold text-foreground">Video style</p>
        <p className="mt-0.5 text-xs text-muted">How your photos are paced and framed in the clip.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.entries(VIDEO_COMPILATION_STYLES) as [VideoCompilationStyleId, (typeof VIDEO_COMPILATION_STYLES)[VideoCompilationStyleId]][]).map(
            ([id, meta]) => (
              <OptionChip
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
      <div>
        <p className="text-sm font-semibold text-foreground">Background audio</p>
        <p className="mt-0.5 text-xs text-muted">Optional subtle soundtrack mixed into the final MP4.</p>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {(Object.entries(VIDEO_COMPILATION_AUDIO) as [VideoCompilationAudioId, (typeof VIDEO_COMPILATION_AUDIO)[VideoCompilationAudioId]][]).map(
            ([id, meta]) => (
              <OptionChip
                key={id}
                active={value.audio === id}
                label={meta.label}
                description={meta.description}
                onClick={() => setAudio(id)}
                disabled={disabled}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
}
