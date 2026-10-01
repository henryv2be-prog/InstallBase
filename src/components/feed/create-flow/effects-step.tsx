"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { CreateVideoStyleLivePreview } from "@/components/feed/create-video-style-live-preview";
import { GlassPickerChip, GlassPickerShell } from "@/components/feed/create-flow/glass-horizontal-picker";
import { STYLE_PICKER_ORDER } from "@/components/feed/create-video-style-picker";
import { VIDEO_COMPILATION_STYLES } from "@/lib/video-compilation/style-presets";
import type { VideoCompilationOptions } from "@/lib/video-compilation/options";
import { cn } from "@/lib/utils";

interface EffectsStepProps {
  previewImageUrls: string[];
  compilationOptions: VideoCompilationOptions;
  onStyleChange: (styleId: VideoCompilationOptions["style"]) => void;
  onContinue: () => void;
  continuing?: boolean;
}

export function CreateFlowEffectsStep({
  previewImageUrls,
  compilationOptions,
  onStyleChange,
  onContinue,
  continuing,
}: EffectsStepProps) {
  const orderedStyles = useMemo(
    () => STYLE_PICKER_ORDER.map((id) => ({ id, meta: VIDEO_COMPILATION_STYLES[id] })),
    []
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        <CreateVideoStyleLivePreview
          styleId={compilationOptions.style}
          imageUrls={previewImageUrls}
          immersive
          className="h-full"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
      </div>

      <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+1rem)] pt-12">
        <div className="pointer-events-auto">
          <GlassPickerShell label="Style">
            {orderedStyles.map(({ id, meta }) => (
              <GlassPickerChip
                key={id}
                active={compilationOptions.style === id}
                label={meta.label}
                sub={meta.description}
                disabled={continuing}
                onClick={() => onStyleChange(id)}
              />
            ))}
          </GlassPickerShell>
        </div>
        <p className="pointer-events-none text-center text-[11px] text-white/60">
          Tap styles to preview instantly. HD render runs once you continue.
        </p>
        <Button
          type="button"
          className={cn("pointer-events-auto min-h-12 w-full touch-manipulation")}
          onClick={onContinue}
          disabled={continuing || previewImageUrls.length === 0}
        >
          {continuing ? "Starting render…" : "Continue"}
        </Button>
      </div>
    </div>
  );
}
