"use client";

import { useState } from "react";
import { ImagePlus, Loader2, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MAX_POST_MEDIA } from "@/lib/prepare-media";
import { cn } from "@/lib/utils";
import type { CreateFlowMediaItem } from "@/components/feed/create-flow/types";

interface MediaStepProps {
  media: CreateFlowMediaItem[];
  onAddClick: () => void;
  onRemove: (id: string) => void;
  onRetry: (item: CreateFlowMediaItem) => void;
  onContinue: () => void;
  continueDisabled: boolean;
  uploading: boolean;
}

export function CreateFlowMediaStep({
  media,
  onAddClick,
  onRemove,
  onRetry,
  onContinue,
  continueDisabled,
  uploading,
}: MediaStepProps) {
  const [heroIndex, setHeroIndex] = useState(0);
  const safeHeroIndex = media.length === 0 ? 0 : Math.min(heroIndex, media.length - 1);
  const hero = media[safeHeroIndex];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-1 pb-3 pt-12 text-center sm:pt-14">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">Choose what to post</h2>
        <p className="mt-1 text-sm text-muted">Photos, videos, or both — add up to {MAX_POST_MEDIA}.</p>
      </div>

      <div className="relative min-h-0 flex-1 px-1">
        {hero ? (
          <div className="relative mx-auto flex h-full max-h-full w-full max-w-lg flex-col">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-3xl bg-black shadow-2xl ring-1 ring-border/40">
              {hero.kind === "video" ? (
                <video src={hero.previewUrl} className="h-full w-full object-cover" muted playsInline autoPlay loop />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero.previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              {hero.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50">
                  <Loader2 className="h-10 w-10 animate-spin text-white" />
                  {typeof hero.progress === "number" && hero.progress > 0 ? (
                    <p className="text-sm font-medium text-white">{hero.progress}%</p>
                  ) : null}
                </div>
              )}
              {hero.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/60 p-4 text-center">
                  <p className="text-sm text-white">{hero.error ?? "Upload failed"}</p>
                  <button
                    type="button"
                    className="rounded-full bg-white/20 px-3 py-1.5 text-sm text-white"
                    onClick={() => onRetry(hero)}
                  >
                    Try again
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => onRemove(hero.id)}
                className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm"
                aria-label="Remove"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {media.length > 1 && (
              <div className="mt-3 flex shrink-0 gap-2 overflow-x-auto pb-1 snap-x [-webkit-overflow-scrolling:touch]">
                {media.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setHeroIndex(index)}
                    className={cn(
                      "relative h-16 w-16 shrink-0 snap-start overflow-hidden rounded-xl ring-2",
                      index === safeHeroIndex ? "ring-primary" : "ring-transparent"
                    )}
                  >
                    {item.kind === "video" ? (
                      <video src={item.previewUrl} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
                    )}
                    {item.status === "uploading" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      </div>
                    )}
                    {item.status === "error" && (
                      <button
                        type="button"
                        className="absolute inset-0 flex items-center justify-center bg-black/55"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRetry(item);
                        }}
                        aria-label="Retry"
                      >
                        <RotateCcw className="h-4 w-4 text-white" />
                      </button>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <button
            type="button"
            onClick={onAddClick}
            className="mx-auto flex h-full min-h-[min(52dvh,28rem)] w-full max-w-lg flex-col items-center justify-center gap-4 rounded-3xl border border-dashed border-primary/35 bg-gradient-to-b from-primary/5 to-transparent p-8 text-center transition hover:border-primary/55 hover:from-primary/10"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <ImagePlus className="h-8 w-8" />
            </span>
            <div>
              <p className="text-lg font-semibold text-foreground">Add photos or video</p>
              <p className="mt-1 text-sm text-muted">Tap to open your gallery</p>
            </div>
          </button>
        )}
      </div>

      <div className="create-flow-action-dock z-20 shrink-0 space-y-2 border-t border-border/40 bg-[var(--background)]/90 px-1 pt-3 backdrop-blur-md">
        {media.length > 0 && media.length < MAX_POST_MEDIA && (
          <Button type="button" variant="outline" className="min-h-11 w-full touch-manipulation" onClick={onAddClick}>
            {uploading ? "Uploading…" : "Add more"}
          </Button>
        )}
        {!hero && (
          <Button type="button" variant="ghost" className="min-h-11 w-full text-muted" onClick={onContinue} disabled={continueDisabled}>
            Text-only question
          </Button>
        )}
        <Button type="button" className="min-h-12 w-full touch-manipulation text-base" onClick={onContinue} disabled={continueDisabled}>
          Continue
        </Button>
      </div>
    </div>
  );
}
