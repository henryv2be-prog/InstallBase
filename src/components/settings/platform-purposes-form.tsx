"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updatePlatformPurposes } from "@/lib/actions";
import {
  PLATFORM_PURPOSES,
  rolesToPurposeIds,
  type PlatformPurposeId,
} from "@/lib/platform-roles";
import type { PlatformRole } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PlatformPurposesFormProps {
  initialRoles: PlatformRole[];
}

export function PlatformPurposesForm({ initialRoles }: PlatformPurposesFormProps) {
  const [pending, startTransition] = useTransition();
  const [purposes, setPurposes] = useState<PlatformPurposeId[]>(() => rolesToPurposeIds(initialRoles));

  const togglePurpose = (id: PlatformPurposeId) => {
    setPurposes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    purposes.forEach((purpose) => formData.append("purposes", purpose));

    startTransition(async () => {
      try {
        await updatePlatformPurposes(formData);
        toast.success("How you use InstallBase has been updated");
      } catch {
        toast.error("Could not save your preferences. Please try again.");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <p className="text-sm text-muted">
        Choose what you use InstallBase for. This controls which features are enabled for you — it
        does not delete your profile or posts.
      </p>
      <div className="space-y-2">
        {PLATFORM_PURPOSES.map((purpose) => {
          const selected = purposes.includes(purpose.id);
          return (
            <label
              key={purpose.id}
              className={cn(
                "flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors",
                selected
                  ? "border-blue-500 bg-blue-50 dark:bg-blue-950/30"
                  : "border-border hover:border-blue-300/60"
              )}
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() => togglePurpose(purpose.id)}
                className="mt-1 rounded"
              />
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <span aria-hidden>{purpose.emoji}</span>
                  {purpose.title}
                </span>
                <span className="mt-0.5 block text-xs text-muted">{purpose.description}</span>
              </span>
            </label>
          );
        })}
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
