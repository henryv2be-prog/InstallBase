"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateVideoSoundPicker } from "@/components/feed/create-video-sound-picker";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import { useVideoSoundLibrary } from "@/hooks/use-video-sound-library";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";

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
    <div className="space-y-5">
      <div className="rounded-xl border border-border bg-card/50 px-4 py-3">
        <p className="text-sm font-medium text-foreground">{statusLabel[status] ?? "Create video"}</p>
        <p className="mt-1 text-xs text-muted">
          {busy
            ? "Usually under a minute. You can go back to change photos if you need to."
            : status === "READY"
              ? "Step 1: watch your clip. Step 2: pick a sound — hear it live. Step 3: post."
              : "Your photos are safe. Try again or post as a carousel."}
        </p>
      </div>

      {busy && (
        <div className="flex aspect-[9/16] max-w-md flex-col items-center justify-center gap-3 rounded-2xl bg-gray-900/90 text-white mx-auto">
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
          />
          <CreateVideoSoundPicker
            value={selectedAudio}
            onChange={onAudioChange}
            tracks={tracks}
            loading={tracksLoading}
            disabled={posting}
          />
        </>
      )}

      {!busy && status === "FAILED" && (
        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
          {error ?? "Something went wrong. Your photos are still saved."}
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" onClick={onBack} disabled={posting}>
          Change photos
        </Button>
        {(status === "READY" || status === "FAILED") && (
          <Button type="button" variant="secondary" onClick={onRegenerate} disabled={posting || busy}>
            Regenerate video
          </Button>
        )}
        {status === "FAILED" && (
          <Button type="button" variant="outline" onClick={onPostAsPhotos} disabled={posting}>
            Post as photos instead
          </Button>
        )}
        <Button
          type="button"
          className="sm:ml-auto min-h-11"
          onClick={onPost}
          disabled={posting || status !== "READY" || !audioReady}
        >
          {posting ? "Posting…" : "Post to feed"}
        </Button>
      </div>
    </div>
  );
}
