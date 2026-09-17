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
      toast.success(next ? "Daily community updates enabled" : "Daily community updates turned off");
    });
  };

  return (
    <div className="space-y-3 rounded-lg border border-gray-200 p-4 dark:border-gray-800">
      <div>
        <p className="text-sm font-medium">Daily community updates</p>
        <p className="mt-1 text-sm text-muted">
          At most one push per day summarising new installs, questions, and community activity — only when you have not
          opened InstallBase yet. Turn this off here if the daily reminder is not for you. Messages and other alerts
          stay on.
        </p>
      </div>
      <Button variant="outline" onClick={toggle} disabled={pending}>
        {checked ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
        {pending ? "Updating…" : checked ? "Turn off daily updates" : "Turn on daily updates"}
      </Button>
    </div>
  );
}
