"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { PlatformPurposePicker } from "@/components/auth/platform-purpose-picker";
import { updatePlatformPurposes } from "@/lib/actions";
import { rolesToPurposeIds, type PlatformPurposeId } from "@/lib/platform-roles";
import type { PlatformRole } from "@/generated/prisma/client";
import { toast } from "sonner";

interface PlatformPurposesFormProps {
  initialRoles: PlatformRole[];
}

export function PlatformPurposesForm({ initialRoles }: PlatformPurposesFormProps) {
  const [pending, startTransition] = useTransition();
  const [purposes, setPurposes] = useState<PlatformPurposeId[]>(() => rolesToPurposeIds(initialRoles));

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
      <PlatformPurposePicker
        value={purposes}
        onChange={setPurposes}
        disabled={pending}
        mode="checkbox"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save preferences"}
      </Button>
    </form>
  );
}
