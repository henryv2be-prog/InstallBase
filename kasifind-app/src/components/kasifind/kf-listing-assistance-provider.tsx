"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { HandHelping, Loader2, X } from "lucide-react";
import { kfSubmitListingAssistanceRequest } from "@/lib/kasifind/listing-assistance-actions";
import type { ProviderAssistanceRequestView } from "@/lib/kasifind/listing-assistance";
import { isActiveListingAssistanceStatus } from "@/lib/kasifind/listing-assistance-status";
import {
  formatCompletenessGapsSentence,
  getListingCompletenessGaps,
  LISTING_ASSISTANCE_ENTRY_DISMISS_KEY,
  type ListingCompletenessInput,
} from "@/lib/kasifind/listing-assistance-prompt";

type PublishChoice = "help" | "continue" | "cancel";

type Ctx = {
  openHelpDialog: () => void;
  offerHelpBeforePublish: (input: ListingCompletenessInput) => Promise<PublishChoice>;
};

const ListingAssistanceContext = createContext<Ctx | null>(null);

export function useListingAssistance() {
  return useContext(ListingAssistanceContext);
}

export function KfListingAssistanceProvider({
  hasListing,
  canSubmit,
  currentRequest,
  children,
}: {
  hasListing: boolean;
  canSubmit: boolean;
  currentRequest: ProviderAssistanceRequestView | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mode, setMode] = useState<"entry" | "publish">("entry");
  const [publishGaps, setPublishGaps] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const publishResolverRef = useRef<((choice: PublishChoice) => void) | null>(null);

  const activeRequest =
    currentRequest && isActiveListingAssistanceStatus(currentRequest.status);

  const openHelpDialog = useCallback(() => {
    if (!hasListing) {
      router.push("/account/listing");
      return;
    }
    if (activeRequest || !canSubmit) {
      router.push("/account/listing-support");
      return;
    }
    setMode("entry");
    setPublishGaps([]);
    setError(null);
    setDialogOpen(true);
  }, [activeRequest, canSubmit, hasListing, router]);

  const offerHelpBeforePublish = useCallback(
    (input: ListingCompletenessInput) => {
      const gaps = getListingCompletenessGaps(input);
      if (!canSubmit || activeRequest || gaps.length === 0) {
        return Promise.resolve("continue" as const);
      }
      return new Promise<PublishChoice>((resolve) => {
        publishResolverRef.current = resolve;
        setMode("publish");
        setPublishGaps(gaps);
        setError(null);
        setMessage("");
        setDialogOpen(true);
      });
    },
    [activeRequest, canSubmit]
  );

  useEffect(() => {
    if (searchParams.get("help") === "1") {
      router.replace("/account/listing-support");
      return;
    }
    if (!hasListing || !canSubmit || activeRequest) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(LISTING_ASSISTANCE_ENTRY_DISMISS_KEY) === "1") return;
    setMode("entry");
    setDialogOpen(true);
  }, [activeRequest, canSubmit, hasListing, searchParams, router]);

  const closeDialog = (choice: PublishChoice = "cancel") => {
    setDialogOpen(false);
    setMessage("");
    setError(null);
    const resolver = publishResolverRef.current;
    publishResolverRef.current = null;
    if (resolver) resolver(choice);
  };

  const dismissEntry = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(LISTING_ASSISTANCE_ENTRY_DISMISS_KEY, "1");
    }
    closeDialog("cancel");
  };

  const submitRequest = (thenClose: PublishChoice) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("providerMessage", message);
      const result = await kfSubmitListingAssistanceRequest(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      if (typeof window !== "undefined") {
        window.localStorage.setItem(LISTING_ASSISTANCE_ENTRY_DISMISS_KEY, "1");
      }
      setDialogOpen(false);
      setMessage("");
      const resolver = publishResolverRef.current;
      publishResolverRef.current = null;
      if (resolver) resolver(thenClose);
      else closeDialog("cancel");
      router.refresh();
    });
  };

  const value = useMemo(() => ({ openHelpDialog, offerHelpBeforePublish }), [openHelpDialog, offerHelpBeforePublish]);

  return (
    <ListingAssistanceContext.Provider value={value}>
      {children}
      {dialogOpen ? (
        <KfListingAssistanceDialogPanel
          mode={mode}
          publishGaps={publishGaps}
          message={message}
          error={error}
          pending={pending}
          onMessageChange={setMessage}
          onRequest={() => submitRequest(mode === "publish" ? "help" : "cancel")}
          onDismissEntry={dismissEntry}
          onContinuePublish={() => closeDialog("continue")}
          onBackdropClose={() => (mode === "entry" ? dismissEntry() : closeDialog("cancel"))}
        />
      ) : null}
    </ListingAssistanceContext.Provider>
  );
}

function KfListingAssistanceDialogPanel({
  mode,
  publishGaps,
  message,
  error,
  pending,
  onMessageChange,
  onRequest,
  onDismissEntry,
  onContinuePublish,
  onBackdropClose,
}: {
  mode: "entry" | "publish";
  publishGaps: string[];
  message: string;
  error: string | null;
  pending: boolean;
  onMessageChange: (v: string) => void;
  onRequest: () => void;
  onDismissEntry: () => void;
  onContinuePublish: () => void;
  onBackdropClose: () => void;
}) {
  const gapsSentence = formatCompletenessGapsSentence(publishGaps);

  return (
    <div className="kf-dialog-root" role="presentation">
      <button type="button" className="kf-dialog-backdrop" aria-label="Close dialog" onClick={onBackdropClose} />
      <div
        className="kf-dialog-panel kf-animate-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="kf-listing-assistance-title"
        aria-describedby="kf-listing-assistance-desc"
      >
        <button type="button" className="kf-dialog-close" aria-label="Close" onClick={onBackdropClose}>
          <X className="h-5 w-5" />
        </button>
        <div className="kf-dialog-icon" aria-hidden>
          <HandHelping className="h-7 w-7" />
        </div>
        <h2 id="kf-listing-assistance-title" className="kf-dialog-title">
          {mode === "publish" ? "Want help finishing your listing?" : "Need a hand with your listing?"}
        </h2>
        <p id="kf-listing-assistance-desc" className="kf-dialog-body">
          {mode === "publish" ? (
            <>
              Before you publish, you&apos;re still missing {gapsSentence}. You can keep going on your
              own, or request free help from KasiFind to polish photos, descriptions, and details.
            </>
          ) : (
            <>
              Not sure how to update your listing? Need help with photos, descriptions or business
              information? Request assistance and we&apos;ll help you get your business looking its best.
            </>
          )}
        </p>

        <label className="kf-label mt-3 block text-left text-sm">
          What would you like help with? <span className="font-normal text-[var(--kf-muted)]">(optional)</span>
          <textarea
            className="kf-input mt-1 min-h-[4.5rem] w-full"
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            maxLength={2000}
            placeholder="e.g. Help me add better photos and a clearer description…"
          />
        </label>

        {error ? (
          <p className="mt-2 text-left text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="kf-dialog-actions mt-4">
          <button type="button" className="kf-btn kf-btn-primary w-full" disabled={pending} onClick={onRequest}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : null}
            Request listing assistance
          </button>
          {mode === "publish" ? (
            <button type="button" className="kf-btn kf-btn-outline w-full" disabled={pending} onClick={onContinuePublish}>
              Continue publishing on my own
            </button>
          ) : (
            <button type="button" className="kf-btn kf-btn-ghost w-full" disabled={pending} onClick={onDismissEntry}>
              Not now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function KfListingAssistanceHeroExtras({
  currentRequest,
  canSubmit,
  tone = "hero",
}: {
  currentRequest: ProviderAssistanceRequestView | null;
  canSubmit: boolean;
  tone?: "hero" | "surface";
}) {
  const statusClass =
    tone === "hero" ? "mt-2 text-sm text-white/85" : "text-sm text-[var(--kf-muted)]";

  return (
    <div className={tone === "hero" ? "mt-2 space-y-2" : "space-y-2"}>
      {currentRequest ? (
        <p className={statusClass} role="status">
          Listing support: <strong>{currentRequest.statusLabel}</strong>
        </p>
      ) : null}
      <Link
        href="/account/listing-support"
        className={
          tone === "hero"
            ? "inline-block text-sm font-medium text-white underline decoration-white/50 underline-offset-2 hover:decoration-white"
            : "kf-btn kf-btn-outline text-sm"
        }
      >
        {canSubmit ? "Request listing support" : "View listing support"}
      </Link>
    </div>
  );
}
