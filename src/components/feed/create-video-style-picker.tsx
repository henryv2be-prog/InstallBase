"use client";

import {
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationOptions,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/options";
import { cn } from "@/lib/utils";

interface CreateVideoStylePickerProps {
  value: VideoCompilationOptions;
  onChange: (next: VideoCompilationOptions) => void;
  disabled?: boolean;
}

export function CreateVideoStylePicker({ value, onChange, disabled }: CreateVideoStylePickerProps) {
  return (
    <div className="mb-4 rounded-xl border border-border bg-card/30 p-4">
      <p className="text-sm font-semibold text-foreground">Video style</p>
      <p className="mt-0.5 text-xs text-muted">Pacing and motion — you pick music after the video is ready.</p>
      <div className="mt-3 flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory">
        {(Object.entries(VIDEO_COMPILATION_STYLES) as [VideoCompilationStyleId, (typeof VIDEO_COMPILATION_STYLES)[VideoCompilationStyleId]][]).map(
          ([id, meta]) => {
            const active = value.style === id;
            return (
              <button
                key={id}
                type="button"
                disabled={disabled}
                onClick={() => onChange({ ...value, style: id })}
                className={cn(
                  "min-w-[8.5rem] shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition-colors",
                  active
                    ? "border-primary bg-primary/10 ring-2 ring-primary/35"
                    : "border-border bg-card/50 hover:border-primary/30",
                  disabled && "pointer-events-none opacity-50"
                )}
              >
                <span className="block text-sm font-medium text-foreground">{meta.label}</span>
                <span className="mt-0.5 block text-[11px] leading-snug text-muted">{meta.description}</span>
              </button>
            );
          }
        )}
      </div>
    </div>
  );
}
