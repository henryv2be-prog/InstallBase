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
}

export function CreateVideoStylePicker({
  value,
  onChange,
  previewImageUrls,
  disabled,
}: CreateVideoStylePickerProps) {
  const grouped = {
    Slide: STYLE_PICKER_ORDER.filter((id) => VIDEO_COMPILATION_STYLES[id].category === "Slide"),
    Motion: STYLE_PICKER_ORDER.filter((id) => VIDEO_COMPILATION_STYLES[id].category === "Motion"),
  };

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

      {(Object.entries(grouped) as [string, VideoCompilationStyleId[]][]).map(([category, ids]) =>
        ids.length === 0 ? null : (
          <div key={category} className="mt-4">
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">{category}</p>
            <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory [-webkit-overflow-scrolling:touch]">
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
                      "min-w-[8.75rem] max-w-[10rem] shrink-0 snap-start rounded-xl border px-3 py-2.5 text-left transition-all touch-manipulation",
                      active
                        ? "scale-[1.02] border-primary bg-primary/10 ring-2 ring-primary/35 shadow-sm"
                        : "border-border bg-card/50 hover:border-primary/30 active:scale-[0.98]",
                      disabled && "pointer-events-none opacity-50"
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">{meta.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-snug text-muted">{meta.description}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}
