"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { HandHelping, Loader2 } from "lucide-react";
import { kfSubmitListingAssistanceRequest } from "@/lib/kasifind/listing-assistance-actions";
import type { ProviderAssistanceRequestView } from "@/lib/kasifind/listing-assistance";

export function KfListingAssistanceRequest({
  hasListing,
  currentRequest,
  canSubmit,
}: {
  hasListing: boolean;
  currentRequest: ProviderAssistanceRequestView | null;
  canSubmit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  if (!hasListing) return null;

  const active =
    currentRequest &&
    (currentRequest.status === "PENDING" || currentRequest.status === "IN_PROGRESS");

  return (
    <section className="kf-card rounded-2xl p-5">
      <AssistanceSectionHeader />
      <p className="mt-2 text-sm leading-relaxed text-[var(--kf-muted)]">
        Not sure how to update your listing? Need help with photos, descriptions or business
        information? Request assistance and we&apos;ll help you get your business looking its best.
      </p>

      {currentRequest ? (
        <AssistanceStatusBlock request={currentRequest} />
      ) : null}

      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {!active && canSubmit ? (
        <>
          {open ? (
            <form
              className="mt-4 space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setError(null);
                startTransition(async () => {
                  const fd = new FormData();
                  fd.set("providerMessage", message);
                  const result = await kfSubmitListingAssistanceRequest(fd);
                  if ("error" in result && result.error) {
                    setError(result.error);
                    return;
                  }
                  setOpen(false);
                  setMessage("");
                  router.refresh();
                });
              }}
            >
              <label className="kf-label block text-sm">
                What would you like help with? <span className="font-normal">(optional)</span>
                <textarea
                  className="kf-input mt-1 min-h-[5rem] w-full"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={2000}
                  placeholder="e.g. Update my photos and improve my description…"
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <button type="submit" className="kf-btn kf-btn-primary" disabled={pending}>
                  {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Submit request
                </button>
                <button
                  type="button"
                  className="kf-btn kf-btn-outline"
                  disabled={pending}
                  onClick={() => setOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              className="kf-btn kf-btn-primary mt-4"
              onClick={() => setOpen(true)}
            >
              Request listing assistance
            </button>
          )}
        </>
      ) : active ? (
        <p className="mt-3 text-sm text-[var(--kf-muted)]">
          You already have an open request — we&apos;ll update this page when it&apos;s done.
        </p>
      ) : null}
    </section>
  );
}

function AssistanceSectionHeader() {
  return (
    <div className="flex items-center gap-2">
      <HandHelping className="h-5 w-5 text-[var(--kf-forest)]" aria-hidden />
      <h2 className="text-lg font-bold text-[var(--kf-charcoal)]">Need a hand with your listing?</h2>
    </div>
  );
}

function AssistanceStatusBlock({ request }: { request: ProviderAssistanceRequestView }) {
  return (
    <div className="mt-4 rounded-xl border border-[var(--kf-border)] bg-[var(--kf-ivory)] px-3 py-2.5 text-sm">
      <p className="font-semibold text-[var(--kf-forest)]">Status: {request.statusLabel}</p>
      {request.providerMessage ? (
        <p className="mt-1 text-[var(--kf-muted)]">Your note: {request.providerMessage}</p>
      ) : null}
      {(request.status === "COMPLETED" || request.status === "DECLINED") && request.completedAt ? (
        <p className="mt-1 text-xs text-[var(--kf-muted)]">
          Updated{" "}
          {new Date(request.completedAt).toLocaleString("en-ZA", {
            timeZone: "Africa/Johannesburg",
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      ) : null}
    </div>
  );
}
