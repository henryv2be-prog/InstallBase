"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { updateDailyDigestPreference } from "@/lib/actions";
import { toast } from "sonner";
import { Bell, BellOff } from "lucide-react";

export function DailyDigestToggle({ enabled }: { enabled: boolean }) {
  const [checked, setChecked] = useState(enabled);
  const [pending, startTransition] = useTransition();

  const toggle = () => {
    const next = !checked;
    setChecked(next);
    startTransition(async () => {
      const result = await updateDailyDigestPreference(next);
      if ("error" in result) {
        setChecked(!next);
        toast.error(result.error);
        return;
      }
      toast.success(next ? "Community digest enabled" : "Community digest turned off");
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div>
        <p className="text-sm font-medium">Community digest</p>
        <p className="mt-1 text-sm text-muted">
          A weekly email roundup of installs, questions, and Brag points (via Resend), plus at most one push per day
          when you have not opened InstallBase yet. Turn this off to stop both the weekly email and the daily digest
          push. Messages and other alerts stay on.
        </p>
      </div>
      <Button variant="outline" onClick={toggle} disabled={pending}>
        {checked ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {pending ? "Updating…" : checked ? "Turn off digest emails & push" : "Turn on digest emails & push"}
      </Button>
    </div>
  );
}
