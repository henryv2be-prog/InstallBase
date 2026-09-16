"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adminRunDailyReengagement } from "@/lib/actions";
import { toast } from "sonner";

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

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="mb-2 text-lg font-bold">Daily re-engagement</h2>
      <p className="mb-4 text-sm text-muted">
        Preview or run the daily community digest push job. Dry run does not send notifications.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" disabled={pending} onClick={() => run(true)}>
          Dry run
        </Button>
        <Button variant="destructive" disabled={pending} onClick={() => run(false)}>
          Send now (live)
        </Button>
      </div>
      {result ? (
        <pre className="mt-4 max-h-64 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">{result}</pre>
      ) : null}
    </section>
  );
}
