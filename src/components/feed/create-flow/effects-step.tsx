"use client";

import { useMemo } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import { GlassPickerChip, GlassPickerShell } from "@/components/feed/create-flow/glass-horizontal-picker";
import { STYLE_PICKER_ORDER } from "@/components/feed/create-video-style-picker";
import { VIDEO_COMPILATION_STYLES } from "@/lib/video-compilation/style-presets";
import type { VideoCompilationOptions } from "@/lib/video-compilation/options";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";
import { cn } from "@/lib/utils";

interface EffectsStepProps {
  status: CompilationStatus;
  videoUrl: string | null;
  posterUrl: string | null;
  error: string | null;
  compilationOptions: VideoCompilationOptions;
  onStyleChange: (styleId: VideoCompilationOptions["style"]) => void;
  styleBusy: boolean;
  onContinue: () => void;
  continueDisabled: boolean;
  onRegenerate: () => void;
  onPostAsPhotos: () => void;
  onRetryStart: () => void;
}

export function CreateFlowEffectsStep({
  status,
  videoUrl,
  posterUrl,
  error,
  compilationOptions,
  onStyleChange,
  styleBusy,
  onContinue,
  continueDisabled,
  onRegenerate,
  onPostAsPhotos,
  onRetryStart,
}: EffectsStepProps) {
  const busy = status === "QUEUED" || status === "PROCESSING" || styleBusy;
  const ready = status === "READY" && videoUrl;

  const orderedStyles = useMemo(
    () => STYLE_PICKER_ORDER.map((id) => ({ id, meta: VIDEO_COMPILATION_STYLES[id] })),
    []
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        {busy && !videoUrl && (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-white">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-sm font-medium">
              {status === "PROCESSING" ? "Generating your video…" : "Starting generation…"}
            </p>
          </div>
        )}

        {ready && (
          <VideoWithMusicPreview
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            audioId="none"
            tracks={[]}
            edgeToEdge
            className="h-full max-w-none"
          />
        )}

        {status === "FAILED" && (
          <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center text-white">
            <p className="text-base font-medium">{error ?? "Something went wrong"}</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Button type="button" variant="secondary" onClick={onRetryStart}>
                Try again
              </Button>
              <Button type="button" variant="outline" onClick={onRegenerate}>
                Regenerate
              </Button>
              <Button type="button" variant="ghost" className="text-white/80" onClick={onPostAsPhotos}>
                Post as photos
              </Button>
            </div>
          </div>
        )}

        {busy && videoUrl && (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center bg-black/35 backdrop-blur-[2px]">
            <Loader2 className="h-10 w-10 animate-spin text-white" />
          </div>
        )}
      </div>

      {ready && (
        <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+0.5rem)] pt-16">
          <div className="pointer-events-auto">
            <GlassPickerShell label="Style">
              {orderedStyles.map(({ id, meta }) => (
                <GlassPickerChip
                  key={id}
                  active={compilationOptions.style === id}
                  label={meta.label}
                  sub={meta.description}
                  disabled={busy}
                  onClick={() => onStyleChange(id)}
                />
              ))}
            </GlassPickerShell>
          </div>
          <Button
            type="button"
            className={cn("pointer-events-auto min-h-12 w-full touch-manipulation")}
            onClick={onContinue}
            disabled={continueDisabled || busy}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
