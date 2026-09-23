"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  WorkDetailsFields,
  type WorkDetailsFormState,
} from "@/components/feed/work-details-fields";
import { cn } from "@/lib/utils";
import type { CreateFlowMediaItem, FlowPostKind } from "@/components/feed/create-flow/types";

interface ContentStepProps {
  flowKind: FlowPostKind;
  media: CreateFlowMediaItem[];
  content: string;
  title: string;
  onContentChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  work: WorkDetailsFormState;
  showWorkDetails: boolean;
  onToggleWorkDetails: () => void;
  onWorkChange: (patch: Partial<WorkDetailsFormState>) => void;
  onPost: () => void;
  posting: boolean;
  postDisabled: boolean;
}

export function CreateFlowContentStep({
  flowKind,
  media,
  content,
  title,
  onContentChange,
  onTitleChange,
  work,
  showWorkDetails,
  onToggleWorkDetails,
  onWorkChange,
  onPost,
  posting,
  postDisabled,
}: ContentStepProps) {
  const hero = media[0];
  const isQuestion = flowKind === "question";
  const showWork = flowKind === "share_work" || flowKind === "photo_video";

  return (
    <div className="flex h-full min-h-0 flex-col pt-10">
      {!isQuestion && hero ? (
        <div className="relative mx-auto min-h-0 w-full max-w-lg flex-1 overflow-hidden rounded-3xl bg-black shadow-xl ring-1 ring-border/30">
          {hero.kind === "video" ? (
            <video src={hero.previewUrl} className="h-full w-full object-cover" muted playsInline autoPlay loop />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hero.previewUrl} alt="" className="h-full w-full object-cover" />
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
      ) : (
        <div
          className={cn(
            "mx-auto flex w-full max-w-lg flex-1 flex-col justify-center px-2",
            isQuestion && "pt-4"
          )}
        >
          {isQuestion && (
            <h2 className="mb-4 text-center text-xl font-bold text-foreground">What do you want to ask?</h2>
          )}
        </div>
      )}

      <div className="create-flow-action-dock z-20 shrink-0 space-y-3 border-t border-border/40 bg-[var(--background)]/90 px-1 pt-3 backdrop-blur-md">
        <div className="rounded-2xl border border-white/10 bg-black/35 p-3 backdrop-blur-xl">
          <Textarea
            placeholder={isQuestion ? "Type your question…" : "Add a caption…"}
            value={content}
            onChange={(e) => onContentChange(e.target.value)}
            rows={isQuestion ? 4 : 2}
            className="min-h-[3rem] resize-none border-0 bg-transparent px-0 py-0 text-base shadow-none focus-visible:ring-0"
          />
        </div>

        {isQuestion && (
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            className="min-h-11 rounded-2xl border-white/10 bg-black/30 backdrop-blur-md"
          />
        )}

        {showWork && (
          <WorkDetailsFields
            open={showWorkDetails}
            onToggle={onToggleWorkDetails}
            state={work}
            onChange={(patch) => onWorkChange(patch)}
            showIntentPicker
          />
        )}

        <Button
          type="button"
          className="min-h-12 w-full touch-manipulation text-base"
          onClick={onPost}
          disabled={postDisabled || posting}
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
