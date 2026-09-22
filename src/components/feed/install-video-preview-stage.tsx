"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VerticalInstallVideo } from "@/components/feed/vertical-install-video";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";

interface InstallVideoPreviewStageProps {
  status: CompilationStatus;
  videoUrl: string | null;
  posterUrl: string | null;
  error: string | null;
  onBack: () => void;
  onRegenerate: () => void;
  onPost: () => void;
  onPostAsPhotos: () => void;
  posting: boolean;
}

const statusLabel: Record<string, string> = {
  QUEUED: "Preparing your video…",
  PROCESSING: "Building your vertical video…",
  READY: "Preview your video",
  FAILED: "Video generation didn’t work",
};

export function InstallVideoPreviewStage({
  status,
  videoUrl,
  posterUrl,
  error,
  onBack,
  onRegenerate,
  onPost,
  onPostAsPhotos,
  posting,
}: InstallVideoPreviewStageProps) {
  const busy = status === "QUEUED" || status === "PROCESSING";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <p className="text-sm font-medium text-foreground">
          {statusLabel[status] ?? "Create video"}
        </p>
        <p className="mt-1 text-xs text-muted">
          {busy
            ? "Keep this screen open — usually under a minute. You can still go back and change photos."
            : status === "READY"
              ? "This is how it will look in the feed. Post when you’re happy, or regenerate."
              : "Your original photos are safe. Try again or post as a normal photo set."}
        </p>
      </div>

      <div className="relative min-h-[280px]">
        {busy && (
          <div className="flex aspect-[9/16] max-w-md flex-col items-center justify-center gap-3 rounded-2xl bg-gray-900/90 text-white mx-auto">
            <Loader2 className="h-10 w-10 animate-spin" />
            <p className="text-sm font-medium">{status === "QUEUED" ? "Uploading finished — starting…" : "Generating…"}</p>
          </div>
        )}

        {!busy && status === "READY" && videoUrl && (
          <VerticalInstallVideo url={videoUrl} posterUrl={posterUrl} />
        )}

        {!busy && status === "FAILED" && (
          <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-4 text-sm text-destructive">
            {error ?? "Something went wrong. Your photos are still saved."}
          </div>
        )}
      </div>

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
          className="sm:ml-auto"
          onClick={onPost}
          disabled={posting || status !== "READY"}
        >
          {posting ? "Posting…" : "Post video"}
        </Button>
      </div>
    </div>
  );
}
