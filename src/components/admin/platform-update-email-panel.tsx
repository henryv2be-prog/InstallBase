"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  adminRunPlatformUpdateBroadcast,
  adminSendPlatformUpdateTestEmail,
} from "@/lib/actions";
import { toast } from "sonner";
import { Megaphone, Send } from "lucide-react";

type RecentBroadcast = {
  id: string;
  subject: string;
  headline: string;
  sentCount: number;
  failedCount: number;
  dryRun: boolean;
  createdAt: string;
  sentBy: { name: string | null; email: string };
};

const DEFAULT_CTA = "/feed/watch";

export function PlatformUpdateEmailPanel({ recentBroadcasts }: { recentBroadcasts: RecentBroadcast[] }) {
  const [pending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [headline, setHeadline] = useState("");
  const [bodyText, setBodyText] = useState("");
  const [ctaLabel, setCtaLabel] = useState("Open InstallBase");
  const [ctaUrl, setCtaUrl] = useState(DEFAULT_CTA);
  const [confirmText, setConfirmText] = useState("");
  const [lastResult, setLastResult] = useState<string | null>(null);

  const payload = () => ({ subject, headline, bodyText, ctaLabel, ctaUrl });

  const sendTest = () => {
    startTransition(async () => {
      try {
        const result = await adminSendPlatformUpdateTestEmail(payload());
        if ("error" in result) {
          toast.error(result.error);
          return;
        }
        toast.success(`Preview sent to ${result.to}`);
      } catch {
        toast.error("Could not send preview");
      }
    });
  };

  const dryRun = () => {
    startTransition(async () => {
      try {
        const result = await adminRunPlatformUpdateBroadcast({ ...payload(), dryRun: true });
        setLastResult(JSON.stringify(result, null, 2));
        if (result.skipped) {
          toast.error(String(result.skipped));
          return;
        }
        toast.success(`Dry run: would email ${result.eligibleUsers} user(s)`);
      } catch {
        toast.error("Dry run failed");
      }
    });
  };

  const sendLive = () => {
    if (confirmText.trim().toUpperCase() !== "SEND UPDATE") {
      toast.error('Type SEND UPDATE in the confirmation box first');
      return;
    }
    startTransition(async () => {
      try {
        const result = await adminRunPlatformUpdateBroadcast({ ...payload(), dryRun: false });
        setLastResult(JSON.stringify(result, null, 2));
        if (result.skipped) {
          toast.error(String(result.skipped));
          return;
        }
        toast.success(`Sent to ${result.sent} user(s)${result.failed ? ` (${result.failed} failed)` : ""}`);
        setConfirmText("");
      } catch {
        toast.error("Broadcast failed");
      }
    });
  };

  return (
    <section className="rounded-2xl border border-amber-500/30 bg-card p-4">
      <div className="mb-3 flex items-start gap-2">
        <Megaphone className="mt-0.5 h-5 w-5 text-amber-500" />
        <div>
          <h2 className="text-lg font-bold">Platform update email</h2>
          <p className="mt-1 text-sm text-muted">
            Send a branded announcement to every non-suspended account when you ship major changes. Goes to all
            users — not gated by the weekly digest toggle.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="pu-subject">
            Email subject
          </label>
          <Input
            id="pu-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="InstallBase update: New look feed improvements"
            maxLength={120}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="pu-headline">
            Headline (in email body)
          </label>
          <Input
            id="pu-headline"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
            placeholder="Faster video feed and clearer posting"
            maxLength={200}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium" htmlFor="pu-body">
            Update message
          </label>
          <Textarea
            id="pu-body"
            value={bodyText}
            onChange={(e) => setBodyText(e.target.value)}
            rows={8}
            placeholder={"Explain what changed and why it matters.\n\nUse blank lines between paragraphs."}
            maxLength={8000}
            className="font-mono text-sm"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pu-cta-label">
              Button label
            </label>
            <Input id="pu-cta-label" value={ctaLabel} onChange={(e) => setCtaLabel(e.target.value)} maxLength={60} />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="pu-cta-url">
              Button link
            </label>
            <Input
              id="pu-cta-url"
              value={ctaUrl}
              onChange={(e) => setCtaUrl(e.target.value)}
              placeholder={DEFAULT_CTA}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button type="button" variant="outline" disabled={pending} onClick={sendTest}>
            <Send className="h-4 w-4" />
            Preview to my email
          </Button>
          <Button type="button" variant="secondary" disabled={pending} onClick={dryRun}>
            Dry run (count only)
          </Button>
        </div>

        <div className="rounded-xl border border-destructive/40 bg-destructive/5 p-3">
          <p className="text-sm font-medium text-destructive">Send to all users</p>
          <p className="mt-1 text-xs text-muted">
            Type <strong className="text-foreground">SEND UPDATE</strong> to confirm a live broadcast.
          </p>
          <Input
            className="mt-2"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="SEND UPDATE"
            autoComplete="off"
          />
          <Button type="button" variant="destructive" className="mt-3" disabled={pending} onClick={sendLive}>
            Send platform update now
          </Button>
        </div>
      </div>

      {recentBroadcasts.length > 0 && (
        <div className="mt-6 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Recent broadcasts</h3>
          <ul className="mt-2 space-y-2 text-xs text-muted">
            {recentBroadcasts.map((row) => (
              <li key={row.id} className="rounded-lg bg-muted/20 px-3 py-2">
                <span className="font-medium text-foreground">{row.subject}</span>
                {row.dryRun ? " · dry run" : ` · sent ${row.sentCount}`}
                {row.failedCount > 0 ? ` · ${row.failedCount} failed` : ""}
                <span className="block">
                  {new Date(row.createdAt).toLocaleString()} · {row.sentBy.name ?? row.sentBy.email}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {lastResult ? (
        <pre className="mt-4 max-h-48 overflow-auto rounded-lg bg-muted/30 p-3 text-xs">{lastResult}</pre>
      ) : null}
    </section>
  );
}
