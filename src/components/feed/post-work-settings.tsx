"use client";

import { useState, useTransition } from "react";
import { Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  WorkDetailsFields,
  type WorkDetailsFormState,
} from "@/components/feed/work-details-fields";
import { updatePostWorkSettings } from "@/lib/actions";
import {
  computeDefaultInPortfolio,
  parseWorkDetails,
} from "@/lib/work-posts";
import type { PostIntent, PostType } from "@/generated/prisma/client";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface PostWorkSettingsProps {
  postId: string;
  type: PostType;
  postIntent: PostIntent;
  inPortfolio: boolean;
  location: string | null;
  showExactLocation: boolean;
  workDate: Date | null;
  workDetails: unknown;
  categories: { category: { name: string } }[];
}

function toDateInput(value: Date | null): string {
  if (!value) return "";
  return value.toISOString().slice(0, 10);
}

export function PostWorkSettings({
  postId,
  type,
  postIntent,
  inPortfolio,
  location,
  showExactLocation,
  workDate,
  workDetails,
  categories,
}: PostWorkSettingsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const parsed = parseWorkDetails(workDetails);

  const [includeInWork, setIncludeInWork] = useState(inPortfolio);
  const [work, setWork] = useState<WorkDetailsFormState>(() => ({
    postIntent: type === "PROJECT" ? "PROJECT_INSTALLATION" : postIntent,
    workTrade: parsed.trade || categories[0]?.category.name || "",
    workProjectType: parsed.projectType || "",
    workDeviceCount: parsed.deviceCount || "",
    workDate: toDateInput(workDate),
    workEquipmentNotes: parsed.equipmentNotes || "",
    location: location || "",
    showExactLocation,
  }));

  const handleSave = () => {
    const formData = new FormData();
    formData.append("postId", postId);
    formData.append("inPortfolio", includeInWork ? "true" : "false");
    formData.append("postIntent", work.postIntent);
    formData.append("showExactLocation", work.showExactLocation ? "true" : "false");
    if (work.location.trim()) formData.append("location", work.location.trim());
    if (work.workTrade) formData.append("workTrade", work.workTrade);
    if (work.workProjectType) formData.append("workProjectType", work.workProjectType);
    if (work.workDeviceCount) formData.append("workDeviceCount", work.workDeviceCount);
    if (work.workDate) formData.append("workDate", work.workDate);
    if (work.workEquipmentNotes) formData.append("workEquipmentNotes", work.workEquipmentNotes);

    startTransition(async () => {
      try {
        const result = await updatePostWorkSettings(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        toast.success("Work settings updated");
        setOpen(false);
        router.refresh();
      } catch {
        toast.error("Could not update work settings");
      }
    });
  };

  const defaultEligible = computeDefaultInPortfolio(type, work.postIntent);

  return (
    <div className="glass-card rounded-2xl p-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold">
            <Settings2 className="h-4 w-4" />
            Work settings
          </p>
          <p className="mt-1 text-xs text-muted">
            Control whether this post appears in your Work shared area and update work details.
          </p>
        </div>
        <span className="text-xs text-muted">{open ? "Hide" : "Edit"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          <label className="flex items-start gap-2 text-sm">
            <input
              type="checkbox"
              checked={includeInWork}
              onChange={(e) => setIncludeInWork(e.target.checked)}
              className="mt-1 rounded"
            />
            <span>
              Show in my Work shared area
              <span className="mt-0.5 block text-xs text-muted">
                {defaultEligible
                  ? "This post is the kind of work you usually share on your profile."
                  : "You can include any post as work evidence, even if it was originally a general post."}
              </span>
            </span>
          </label>

          <WorkDetailsFields
            open
            onToggle={() => undefined}
            state={work}
            onChange={(patch) => setWork((prev) => ({ ...prev, ...patch }))}
            showIntentPicker={type !== "PROJECT"}
            embedded
          />

          <Button onClick={handleSave} disabled={pending} size="sm">
            {pending ? "Saving..." : "Save work settings"}
          </Button>
        </div>
      )}
    </div>
  );
}
