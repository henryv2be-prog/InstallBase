"use client";

import { Clapperboard, Images } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MediaReadyStepProps {
  autoVideoEnabled: boolean;
  onCreateVideo: () => void;
  onContinuePhotos: () => void;
}

export function CreateFlowMediaReadyStep({
  autoVideoEnabled,
  onCreateVideo,
  onContinuePhotos,
}: MediaReadyStepProps) {
  return (
    <div className="flex h-full min-h-0 flex-col pt-10">
      <div className="shrink-0 px-1 pb-6 text-center">
        <h2 className="text-xl font-bold text-foreground">Your media is ready</h2>
        <p className="mt-1 text-sm text-muted">Post as photos and video, or turn your shots into an install video.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 px-1">
        <button
          type="button"
          disabled={!autoVideoEnabled}
          onClick={onCreateVideo}
          className={cn(
            "flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-xl transition touch-manipulation",
            autoVideoEnabled
              ? "hover:border-primary/40 hover:bg-black/40 active:scale-[0.99]"
              : "cursor-not-allowed opacity-45"
          )}
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Clapperboard className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-foreground">Create a video ✨</span>
            <span className="mt-0.5 block text-sm text-muted">One photo or many — add motion and music</span>
          </span>
        </button>

        <button
          type="button"
          onClick={onContinuePhotos}
          className="flex w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-xl transition touch-manipulation hover:border-primary/40 hover:bg-black/40 active:scale-[0.99]"
        >
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10 text-foreground">
            <Images className="h-6 w-6" />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-bold text-foreground">Continue with photos / video</span>
            <span className="mt-0.5 block text-sm text-muted">Add a caption and post to your profile</span>
          </span>
        </button>
      </div>

      <div className="create-flow-action-dock shrink-0 px-1 pt-3">
        {!autoVideoEnabled ? (
          <p className="text-center text-xs text-muted">Add an install photo to unlock video, or continue to pick a soundtrack for the reel.</p>
        ) : (
          <Button type="button" variant="outline" className="min-h-11 w-full" onClick={onContinuePhotos}>
            Continue with photos / video
          </Button>
        )}
      </div>
    </div>
  );
}
