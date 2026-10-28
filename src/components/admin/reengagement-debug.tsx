"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  adminRunDailyReengagement,
  adminRunWeeklyReengagementEmail,
  adminSendTestReengagement,
  adminSendTestWeeklyReengagementEmail,
} from "@/lib/actions";
import { toast } from "sonner";
import { Send } from "lucide-react";

export function ReengagementDebugPanel() {
  const [result, setResult] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const run = (dryRun: boolean) => {
    startTransition(async () => {
      try {
        const data = await adminRunDailyReengagement(dryRun);
        setResult(JSON.stringify(data, null, 2));
        toast.success(dryRun ? "Dry run complete" : "Re-engagement job finished");
      } catch {
        toast.error("Could not run re-engagement job");
      }
    });
  };

  const runWeekly = (dryRun: boolean) => {
    startTransition(async () => {
      try {
        const data = await adminRunWeeklyReengagementEmail(dryRun);
        setResult(JSON.stringify(data, null, 2));
        toast.success(dryRun ? "Weekly email dry run complete" : "Weekly email job finished");
      } catch {
        toast.error("Could not run weekly email job");
      }
    });
  };

  const sendWeeklyTestToMe = () => {
    startTransition(async () => {
      try {
        const data = await adminSendTestWeeklyReengagementEmail();
        if ("error" in data) {
          toast.error(data.error);
          return;
        }
        setResult(JSON.stringify(data, null, 2));
        toast.success(`Weekly preview sent to ${data.to}`);
      } catch {
        toast.error("Could not send weekly preview email");
      }
    });
  };

  const sendTestToMe = () => {
    startTransition(async () => {
      try {
        const data = await adminSendTestReengagement();
        if ("error" in data) {
          toast.error(data.error);
          return;
        }
        setResult(JSON.stringify(data, null, 2));
        toast.success(
          data.preview
            ? "Sample preview sent — check your lock screen"
            : "Today's digest preview sent — check your lock screen"
        );
      } catch {
        toast.error("Could not send preview");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-lg font-bold">Daily re-engagement</h2>
      <p className="mb-4 text-sm text-muted">
        Preview what the daily digest looks like on your device, or run the full job for all eligible users.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="default" disabled={pending} onClick={sendTestToMe}>
          <Send className="h-4 w-4" />
          Send test to me
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => run(true)}>
          Dry run
        </Button>
        <Button variant="destructive" disabled={pending} onClick={() => run(false)}>
          Send now (live)
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">
        &quot;Send test to me&quot; uses real activity when available and does not count toward the daily limit.
        Enable alerts in Settings on this device first.
      </p>
      {result ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">{result}</pre>
      ) : null}

      <h2 className="mb-2 mt-8 text-lg font-bold">Weekly re-engagement email (Resend)</h2>
      <p className="mb-4 text-sm text-muted">
        HTML digest to every user with community updates enabled — same stats as the daily push, once per week.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="default" disabled={pending} onClick={sendWeeklyTestToMe}>
          <Send className="h-4 w-4" />
          Email preview to me
        </Button>
        <Button variant="outline" disabled={pending} onClick={() => runWeekly(true)}>
          Weekly dry run
        </Button>
        <Button variant="destructive" disabled={pending} onClick={() => runWeekly(false)}>
          Send weekly emails now
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted">
        Requires RESEND_API_KEY and EMAIL_FROM. Users can opt out under Settings → Daily community updates.
      </p>
    </section>
  );
}
