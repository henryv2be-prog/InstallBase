"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateVideoSoundPicker } from "@/components/feed/create-video-sound-picker";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import { useVideoSoundLibrary } from "@/hooks/use-video-sound-library";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import { cn } from "@/lib/utils";

interface InstallVideoPreviewStageProps {
  status: CompilationStatus;
  videoUrl: string | null;
  posterUrl: string | null;
  error: string | null;
  selectedAudio: VideoCompilationAudioSelection;
  onAudioChange: (audio: VideoCompilationAudioSelection) => void;
  onBack: () => void;
  onRegenerate: () => void;
  onPost: () => void;
  onPostAsPhotos: () => void;
  posting: boolean;
  fitViewport?: boolean;
}

const statusLabel: Record<string, string> = {
  QUEUED: "Building your video…",
  PROCESSING: "Almost there…",
  READY: "Add a sound & preview",
  FAILED: "Video generation didn’t work",
};

export function InstallVideoPreviewStage({
  status,
  videoUrl,
  posterUrl,
  error,
  selectedAudio,
  onAudioChange,
  onBack,
  onRegenerate,
  onPost,
  onPostAsPhotos,
  posting,
  fitViewport,
}: InstallVideoPreviewStageProps) {
  const busy = status === "QUEUED" || status === "PROCESSING";
  const { tracks, loading: tracksLoading } = useVideoSoundLibrary();
  const [audioReady, setAudioReady] = useState(false);
  const offeredDefaultSound = useRef(false);

  useEffect(() => {
    offeredDefaultSound.current = false;
  }, [videoUrl]);

  useEffect(() => {
    if (busy || status !== "READY") return;
    if (tracks.length === 0) {
      setAudioReady(true);
      return;
    }
    if (selectedAudio !== "none" && !tracks.some((t) => t.id === selectedAudio)) {
      onAudioChange(tracks[0]!.id);
    } else if (
      selectedAudio === "none" &&
      !offeredDefaultSound.current &&
      tracks.length > 0
    ) {
      offeredDefaultSound.current = true;
      onAudioChange(tracks[0]!.id);
    }
    setAudioReady(true);
  }, [tracks, busy, status, selectedAudio, onAudioChange]);

  return (
    <div
      className={cn(
        fitViewport ? "flex min-h-0 flex-1 flex-col gap-2 overflow-hidden" : "space-y-5"
      )}
    >
      <div
        className={cn(
          "rounded-xl border border-border bg-card/50 px-3 py-2",
          fitViewport && "shrink-0"
        )}
      >
        <p className="text-sm font-medium leading-snug text-foreground">
          {statusLabel[status] ?? "Create video"}
        </p>
        {!fitViewport && (
          <p className="mt-1 text-xs text-muted">
            {busy
              ? "Usually under a minute. You can go back to change photos if you need to."
              : status === "READY"
                ? "Step 1: watch your clip. Step 2: pick a sound — hear it live. Step 3: post."
                : "Your photos are safe. Try again or post as a carousel."}
          </p>
        )}
      </div>

      {busy && (
        <div
          className={cn(
            "mx-auto flex w-full max-w-md flex-col items-center justify-center gap-2 rounded-2xl bg-gray-900/90 text-white",
            fitViewport ? "min-h-0 flex-1" : "aspect-[9/16] gap-3"
          )}
        >
          <Loader2 className="h-10 w-10 animate-spin" />
          <p className="text-sm font-medium">{status === "QUEUED" ? "Starting…" : "Generating…"}</p>
        </div>
      )}

      {!busy && status === "READY" && videoUrl && (
        <>
          <VideoWithMusicPreview
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            audioId={selectedAudio}
            tracks={tracks}
            fillAvailable={fitViewport}
            className={fitViewport ? "min-h-0 flex-1" : undefined}
          />
          <div className={cn(fitViewport && "shrink-0 [&_.rounded-xl]:p-2 [&_p]:text-xs")}>
            <CreateVideoSoundPicker
              value={selectedAudio}
              onChange={onAudioChange}
              tracks={tracks}
              loading={tracksLoading}
              disabled={posting}
            />
          </div>
        </>
      )}

      {!busy && status === "FAILED" && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
          {error ?? "Something went wrong. Your photos are still saved."}
        </div>
      )}

      <div
        className={cn(
          "grid grid-cols-2 gap-2",
          fitViewport &&
            "install-preview-action-dock create-flow-action-dock sticky bottom-0 z-20 shrink-0 border-t border-border/70 bg-card/95 pt-2 backdrop-blur-md",
          !fitViewport && "flex flex-col sm:flex-row sm:flex-wrap"
        )}
      >
        <Button type="button" variant="outline" size={fitViewport ? "sm" : "default"} onClick={onBack} disabled={posting}>
          Change photos
        </Button>
        {(status === "READY" || status === "FAILED") && (
          <Button
            type="button"
            variant="secondary"
            size={fitViewport ? "sm" : "default"}
            onClick={onRegenerate}
            disabled={posting || busy}
          >
            Regenerate
          </Button>
        )}
        {status === "FAILED" && (
          <Button type="button" variant="outline" size="sm" onClick={onPostAsPhotos} disabled={posting}>
            Post as photos
          </Button>
        )}
        <Button
          type="button"
          className={cn("min-h-11", fitViewport ? "col-span-2" : "sm:ml-auto")}
          size={fitViewport ? "default" : "default"}
          onClick={onPost}
          disabled={posting || status !== "READY" || !audioReady}
        >
          {posting ? "Posting…" : "Post to feed"}
        </Button>
      </div>
    </div>
  );
}
