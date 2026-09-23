"use client";

import { Camera, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentStepProps {
  onShareWork: () => void;
  onAskQuestion: () => void;
}

function IntentCard({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex min-h-[5.5rem] w-full items-center gap-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-left backdrop-blur-xl transition touch-manipulation motion-reduce:transition-none",
        "hover:border-primary/40 hover:bg-black/40 active:scale-[0.99]"
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

export function CreateFlowIntentStep({ onShareWork, onAskQuestion }: IntentStepProps) {
  return (
    <div className="flex h-full min-h-0 flex-col pt-12 sm:pt-14">
      <div className="shrink-0 px-1 pb-4 text-center">
        <h2 className="text-xl font-bold text-foreground sm:text-2xl">What do you want to do?</h2>
        <p className="mt-1 text-sm text-muted">Share installs on your profile or ask the community for help.</p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-1 pb-4 [-webkit-overflow-scrolling:touch]">
        <IntentCard
          icon={<Camera className="h-6 w-6" />}
          title="Share your work"
          description="Photos or video from a job, install, or site visit"
          onClick={onShareWork}
        />
        <IntentCard
          icon={<HelpCircle className="h-6 w-6" />}
          title="Ask a question"
          description="Get advice, troubleshooting tips, or product recommendations"
          onClick={onAskQuestion}
        />
      </div>
    </div>
  );
}
