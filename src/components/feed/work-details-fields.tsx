"use client";

import { ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SPECIALTIES } from "@/lib/constants";
import { COMPOSER_POST_INTENTS } from "@/lib/work-posts";
import type { PostIntent } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type WorkDetailsFormState = {
  postIntent: PostIntent;
  workTrade: string;
  workProjectType: string;
  workDeviceCount: string;
  workDate: string;
  workEquipmentNotes: string;
  showExactLocation: boolean;
};

interface WorkDetailsFieldsProps {
  open: boolean;
  onToggle: () => void;
  state: WorkDetailsFormState;
  onChange: (patch: Partial<WorkDetailsFormState>) => void;
  showIntentPicker?: boolean;
}

export function WorkDetailsFields({
  open,
  onToggle,
  state,
  onChange,
  showIntentPicker = true,
}: WorkDetailsFieldsProps) {
  return (
    <div className="mb-3 rounded-xl border border-border bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-medium"
      >
        <span>Add work details (optional)</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="space-y-3 border-t border-border px-4 py-4">
          {showIntentPicker && (
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">What type of post is this?</label>
              <select
                value={state.postIntent}
                onChange={(e) => onChange({ postIntent: e.target.value as PostIntent })}
                className="flex h-10 w-full rounded-xl border border-border bg-card px-3 text-sm"
              >
                {COMPOSER_POST_INTENTS.map((intent) => (
                  <option key={intent.value} value={intent.value}>
                    {intent.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-medium text-muted">Trade / category</label>
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map((trade) => (
                <button
                  key={trade}
                  type="button"
                  onClick={() =>
                    onChange({ workTrade: state.workTrade === trade ? "" : trade })
                  }
                  className="focus:outline-none"
                >
                  <Badge variant={state.workTrade === trade ? "default" : "outline"}>{trade}</Badge>
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Project type</label>
              <Input
                value={state.workProjectType}
                onChange={(e) => onChange({ workProjectType: e.target.value })}
                placeholder="New install, upgrade, commission..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted">Scale (optional)</label>
              <Input
                value={state.workDeviceCount}
                onChange={(e) => onChange({ workDeviceCount: e.target.value })}
                placeholder="16 doors, 32 cameras..."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Work date (optional)</label>
            <Input
              type="date"
              value={state.workDate}
              onChange={(e) => onChange({ workDate: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-muted">Equipment notes (optional)</label>
            <Input
              value={state.workEquipmentNotes}
              onChange={(e) => onChange({ workEquipmentNotes: e.target.value })}
              placeholder="Brands, models, or systems used"
            />
          </div>

          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={state.showExactLocation}
              onChange={(e) => onChange({ showExactLocation: e.target.checked })}
              className="mt-1 rounded"
            />
            <span>
              Show exact location on this post
              <span className="mt-0.5 block text-xs text-muted">
                Leave unchecked to keep site addresses private. City/area from your profile is still used later for discovery.
              </span>
            </span>
          </label>
        </div>
      )}
    </div>
  );
}
