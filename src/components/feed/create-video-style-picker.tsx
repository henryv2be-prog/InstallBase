"use client";

import {
  VIDEO_COMPILATION_STYLES,
  type VideoCompilationStyleId,
} from "@/lib/video-compilation/style-presets";
import type { VideoCompilationOptions } from "@/lib/video-compilation/options";
import { CreateVideoStyleLivePreview } from "@/components/feed/create-video-style-live-preview";
import { cn } from "@/lib/utils";

/** Shown in the picker (legacy ids still work if stored on old drafts). */
export const STYLE_PICKER_ORDER: VideoCompilationStyleId[] = [
  "cinematic",
  "smooth_fade",
  "slide_left",
  "slide_right",
  "zoom_punch",
  "quick_pop",
  "flash_montage",
];

interface CreateVideoStylePickerProps {
  value: VideoCompilationOptions;
  onChange: (next: VideoCompilationOptions) => void;
  previewImageUrls: string[];
  disabled?: boolean;
  /** Fits /create viewport — inline preview + horizontal style chips only. */
  compact?: boolean;
}

export function CreateVideoStylePicker({
  value,
  onChange,
  previewImageUrls,
  disabled,
  compact,
}: CreateVideoStylePickerProps) {
  const grouped = {
    Slide: STYLE_PICKER_ORDER.filter((id) => VIDEO_COMPILATION_STYLES[id].category === "Slide"),
    Motion: STYLE_PICKER_ORDER.filter((id) => VIDEO_COMPILATION_STYLES[id].category === "Motion"),
  };

  const styleChips = (Object.entries(grouped) as [string, VideoCompilationStyleId[]][]).map(
    ([category, ids]) =>
      ids.length === 0 ? null : (
        <div key={category} className={cn(compact ? "mt-2" : "mt-4")}>
          {!compact && (
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{category}</p>
          )}
          <div className="flex gap-2 overflow-x-auto pb-0.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
            {ids.map((id) => {
              const meta = VIDEO_COMPILATION_STYLES[id];
              const active = value.style === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange({ ...value, style: id })}
                  className={cn(
                    "shrink-0 snap-start rounded-xl border text-left transition-all touch-manipulation",
                    compact
                      ? "min-w-[7rem] max-w-[8.5rem] px-2 py-1.5"
                      : "min-w-[8.75rem] max-w-[10rem] px-3 py-2.5",
                    active
                      ? "scale-[1.02] border-primary bg-primary/10 ring-2 ring-primary/35 shadow-sm"
                      : "border-border bg-card/50 hover:border-primary/30 active:scale-[0.98]",
                    disabled && "pointer-events-none opacity-50"
                  )}
                >
                  <span className={cn("block font-medium text-foreground", compact ? "text-xs" : "text-sm")}>
                    {meta.label}
                  </span>
                  {!compact && (
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">{meta.description}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )
  );

  if (compact) {
    return (
      <div className="mb-0 max-h-[min(11.5rem,28vh)] shrink-0 flex flex-col overflow-hidden rounded-xl border border-border bg-card/30 p-2">
        <div className="flex shrink-0 items-center gap-2">
          <CreateVideoStyleLivePreview
            styleId={value.style}
            imageUrls={previewImageUrls}
            className="max-w-[4.5rem] shrink-0 scale-[0.85] origin-left"
          />
          <p className="min-w-0 flex-1 text-[11px] leading-snug text-muted">
            <span className="font-semibold text-foreground">Video style</span> — tap a preset, then Create
            video.
          </p>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden">{styleChips}</div>
      </div>
    );
  }

  return (
    <div className="mb-4 rounded-xl border border-border bg-card/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <CreateVideoStyleLivePreview styleId={value.style} imageUrls={previewImageUrls} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-foreground">Video style</p>
          <p className="mt-0.5 text-xs text-muted">
            Preview updates instantly on your photos. Tap <strong>Create video</strong> once to render
            in full quality.
          </p>
        </div>
      </div>
      {styleChips}
    </div>
  );
}
