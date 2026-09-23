"use client";

import { Camera, Clapperboard, FolderKanban, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FlowPostKind } from "@/components/feed/create-flow/types";

interface PostTypeStepProps {
  autoVideoEnabled: boolean;
  photoVideoEnabled: boolean;
  onSelect: (kind: FlowPostKind) => void;
}

function TypeCard({
  icon,
  title,
  description,
  disabled,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-[5.5rem] w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-xl transition touch-manipulation motion-reduce:transition-none",
        "hover:border-primary/40 hover:bg-black/40 active:scale-[0.99]",
        disabled && "cursor-not-allowed opacity-40 hover:border-white/10 hover:bg-black/30 active:scale-100"
      )}
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/20 text-primary">{icon}</span>
      <span className="min-w-0">
        <span className="block text-base font-bold text-foreground">{title}</span>
        <span className="mt-0.5 block text-sm text-muted">{description}</span>
      </span>
    </button>
  );
}

export function CreateFlowPostTypeStep({ autoVideoEnabled, photoVideoEnabled, onSelect }: PostTypeStepProps) {
  return (
    <div className="flex h-full min-h-0 flex-col pt-10">
      <div className="shrink-0 px-1 pb-4 text-center">
        <h2 className="text-xl font-bold text-foreground">Pick a format</h2>
        <p className="mt-1 text-sm text-muted">How should this show up in the feed?</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-1 pb-4 [-webkit-overflow-scrolling:touch]">
        <TypeCard
          icon={<Camera className="h-6 w-6" />}
          title="Photo / video"
          description="Post your media as-is"
          disabled={!photoVideoEnabled}
          onClick={() => onSelect("photo_video")}
        />
        <TypeCard
          icon={<Clapperboard className="h-6 w-6" />}
          title="Auto-generated video"
          description="Turn your photos into an install video"
          disabled={!autoVideoEnabled}
          onClick={() => onSelect("auto_video")}
        />
        <TypeCard
          icon={<HelpCircle className="h-6 w-6" />}
          title="Question"
          description="Ask the community"
          onClick={() => onSelect("question")}
        />
        <TypeCard
          icon={<FolderKanban className="h-6 w-6" />}
          title="Project"
          description="Share a full install project"
          onClick={() => onSelect("project")}
        />
      </div>

      <p className="create-flow-action-dock shrink-0 px-1 pt-2 text-center text-xs text-muted">
        {!autoVideoEnabled && photoVideoEnabled
          ? "Add two or more photos for auto-generated video."
          : !photoVideoEnabled
            ? "Add at least one photo or video for media posts."
            : " "}
      </p>
    </div>
  );
}
