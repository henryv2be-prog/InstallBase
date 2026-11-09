"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { HandHelping, Loader2 } from "lucide-react";
import { kfSubmitListingAssistanceRequest } from "@/lib/kasifind/listing-assistance-actions";
import type { ProviderAssistanceRequestView } from "@/lib/kasifind/listing-assistance";
import { isActiveListingAssistanceStatus } from "@/lib/kasifind/listing-assistance-status";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";

export function KfListingSupportPanel({
  hasListing,
  canSubmit,
  currentRequest,
}: {
  hasListing: boolean;
  canSubmit: boolean;
  currentRequest: ProviderAssistanceRequestView | null;
}) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  const active =
    currentRequest && isActiveListingAssistanceStatus(currentRequest.status);

  if (!hasListing) {
    return (
      <ListingSupportCard>
        <p className="text-sm leading-relaxed text-[var(--kf-muted)]">
          Create your listing first, then you can ask our team for hands-on help with photos,
          descriptions, and business details.
        </p>
        <Link href="/account/listing" className="kf-btn kf-btn-primary mt-4">
          Start your listing
        </Link>
      </ListingSupportCard>
    );
  }

  return (
    <ListingSupportCard>
      <ListingSupportPanelHeader />

      {currentRequest ? (
        <ListingSupportStatusBlock request={currentRequest} />
      ) : null}

      {success ? (
        <p className="mt-4 text-sm font-medium text-[var(--kf-forest)]" role="status">
          Thanks — we&apos;ve received your request. Track status here anytime from the menu.
        </p>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {active ? (
        <p className="mt-4 text-sm text-[var(--kf-muted)]">
          You already have an open request. We&apos;ll update this page when it&apos;s completed — no
          need to send another one yet.
        </p>
      ) : canSubmit ? (
        <form
          className="mt-4 space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            setError(null);
            setSuccess(false);
            startTransition(async () => {
              const fd = new FormData();
              fd.set("providerMessage", message);
              const result = await kfSubmitListingAssistanceRequest(fd);
              if ("error" in result && result.error) {
                setError(result.error);
                return;
              }
              setSuccess(true);
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
              placeholder="e.g. Refresh my photos and improve my business description for search…"
            />
          </label>
          <button type="submit" className="kf-btn kf-btn-primary w-full sm:w-auto" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            {currentRequest ? "Request listing support again" : "Request listing support"}
          </button>
        </form>
      ) : (
        <p className="mt-4 text-sm text-[var(--kf-muted)]">
          You can&apos;t send a new request right now. If something looks wrong, contact support from
          the menu.
        </p>
      )}
    </ListingSupportCard>
  );
}

function ListingSupportCard({ children }: { children: React.ReactNode }) {
  return <div className="kf-card rounded-2xl p-5 sm:p-6">{children}</div>;
}

function ListingSupportPanelHeader() {
  return (
    <div className="flex items-start gap-3">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--kf-forest)]/10 text-[var(--kf-forest)]"
        aria-hidden
      >
        <HandHelping className="h-5 w-5" />
      </span>
      <div>
        <h2 className="text-lg font-bold text-[var(--kf-charcoal)]">Hands-on listing support</h2>
        <p className="mt-1 text-sm leading-relaxed text-[var(--kf-muted)]">
          KasiFind can update your listing for you — photos, wording, categories, and contact
          details. Request support here whenever you need a refresh.
        </p>
      </div>
    </div>
  );
}

function ListingSupportStatusBlock({ request }: { request: ProviderAssistanceRequestView }) {
  return (
    <div
      className="mt-4 rounded-xl border border-[var(--kf-border)] bg-[var(--kf-ivory)] px-3 py-2.5 text-sm"
      role="status"
    >
      <p className="font-semibold text-[var(--kf-forest)]">Latest request: {request.statusLabel}</p>
      {request.providerMessage ? (
        <p className="mt-1 text-[var(--kf-muted)]">Your note: {request.providerMessage}</p>
      ) : null}
      <p className="mt-1 text-xs text-[var(--kf-muted)]">
        Requested {formatKfDateTime(request.createdAt)}
      </p>
    </div>
  );
}
