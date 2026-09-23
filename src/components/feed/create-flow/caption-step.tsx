"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { VideoWithMusicPreview } from "@/components/feed/video-with-music-preview";
import {
  WorkDetailsFields,
  type WorkDetailsFormState,
} from "@/components/feed/work-details-fields";
import type { VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";

interface CaptionStepProps {
  videoUrl: string;
  posterUrl: string | null;
  selectedAudio: VideoCompilationAudioSelection;
  tracks: VideoSoundTrackClient[];
  content: string;
  onContentChange: (value: string) => void;
  work: WorkDetailsFormState;
  showWorkDetails: boolean;
  onToggleWorkDetails: () => void;
  onWorkChange: (patch: Partial<WorkDetailsFormState>) => void;
  onPost: () => void;
  posting: boolean;
}

export function CreateFlowCaptionStep({
  videoUrl,
  posterUrl,
  selectedAudio,
  tracks,
  content,
  onContentChange,
  work,
  showWorkDetails,
  onToggleWorkDetails,
  onWorkChange,
  onPost,
  posting,
}: CaptionStepProps) {
  return (
    <div className="relative flex h-full min-h-0 flex-col">
      <div className="absolute inset-0 bg-black">
        <VideoWithMusicPreview
          videoUrl={videoUrl}
          posterUrl={posterUrl}
          audioId={selectedAudio}
          tracks={tracks}
          edgeToEdge
          className="h-full max-w-none"
        />
      </div>

      <div className="pointer-events-none relative z-20 mt-auto space-y-3 px-3 pb-[calc(var(--app-mobile-bottom-clearance)+0.5rem)] pt-24">
        <div className="pointer-events-auto rounded-2xl border border-white/15 bg-black/45 p-3 backdrop-blur-xl">
          <Textarea
            placeholder="Add a caption…"
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={2}
            className="min-h-[2.75rem] resize-none border-0 bg-transparent px-0 py-0 text-base text-white placeholder:text-white/50 shadow-none focus-visible:ring-0"
          />
        </div>

        <div className="pointer-events-auto">
          <WorkDetailsFields
            open={showWorkDetails}
            onToggle={onToggleWorkDetails}
            state={work}
            onChange={(patch) => onWorkChange(patch)}
            showIntentPicker
          />
        </div>

        <Button
          type="button"
          className="pointer-events-auto min-h-12 w-full touch-manipulation text-base"
          onClick={onPost}
          disabled={posting}
        >
          {posting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Posting…
            </>
          ) : (
            "Post"
          )}
        </Button>
      </div>
    </div>
  );
}
