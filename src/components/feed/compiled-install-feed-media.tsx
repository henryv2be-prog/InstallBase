"use client";

import { useState, useTransition } from "react";
import { Trophy } from "lucide-react";
import { VerticalInstallVideo } from "@/components/feed/vertical-install-video";
import { mediaForFeedDisplay } from "@/lib/video-compilation/feed-media";
import type { PostCardData } from "@/lib/queries";
import { toggleMediaBragPoint } from "@/lib/actions";
import { promptJoin } from "@/components/auth/guest-cta";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CompiledInstallFeedMediaProps {
  post: PostCardData;
  canBrag: boolean;
  currentUserId?: string;
  onPostBragScoreChange?: (score: number) => void;
}

export function CompiledInstallFeedMedia({
  post,
  canBrag,
  currentUserId,
  onPostBragScoreChange,
}: CompiledInstallFeedMediaProps) {
  const compiled = mediaForFeedDisplay(post)[0];
  const [pending, startTransition] = useTransition();
  const [bragScore, setBragScore] = useState(compiled?.bragScore ?? 0);
  const [bragged, setBragged] = useState(compiled?.braggedByViewer ?? false);

  if (!post.generatedVideoUrl) return null;

  const handleBrag = () => {
    if (!compiled?.id || compiled.id === "compiled") {
      toast.error("Brag points will be available shortly");
      return;
    }
    if (!currentUserId) {
      promptJoin("give brag points");
      return;
    }

    const wasBragged = bragged;
    const prevScore = bragScore;
    setBragged(!wasBragged);
    setBragScore(wasBragged ? Math.max(0, prevScore - 1) : prevScore + 1);

    startTransition(async () => {
      try {
        const result = await toggleMediaBragPoint(compiled.id!);
        if (result.error) {
          setBragged(wasBragged);
          setBragScore(prevScore);
          toast.error(result.error);
          return;
        }
        if (result.mediaBragScore !== undefined) setBragScore(result.mediaBragScore);
        if (result.bragged !== undefined) setBragged(result.bragged);
        if (result.postBragScore !== undefined) onPostBragScoreChange?.(result.postBragScore);
      } catch {
        setBragged(wasBragged);
        setBragScore(prevScore);
        toast.error("Could not update brag points");
      }
    });
  };

  return (
    <div className="relative mx-auto w-full max-w-md">
      <VerticalInstallVideo
        url={post.generatedVideoUrl}
        posterUrl={post.generatedVideoPosterUrl}
        autoPlayInView
      />
      {canBrag && compiled?.id && (
        <button
          type="button"
          disabled={pending}
          onClick={handleBrag}
          className={cn(
            "absolute right-3 top-3 flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold shadow-md backdrop-blur-sm",
            bragged ? "bg-orange-500 text-white" : "bg-black/55 text-orange-200"
          )}
          aria-label="Give brag points"
        >
          <Trophy className="h-3.5 w-3.5" />
          {bragScore > 0 ? bragScore : "Brag"}
        </button>
      )}
    </div>
  );
}
