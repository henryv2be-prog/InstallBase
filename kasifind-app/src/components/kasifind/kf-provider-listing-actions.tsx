"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { PlusCircle, Share2 } from "lucide-react";
import { useKfToast } from "@/components/kasifind/kf-toast";
import { shareProviderListing } from "@/lib/kasifind/share-provider-listing";

export type KfProviderListingActionsProps = {
  manageHref: string;
  manageLabel: string;
  listingId: string | null;
  displayName: string | null;
  shareEnabled: boolean;
  /** Home hero uses full-width stacked buttons; insights uses a compact row. */
  layout?: "hero" | "inline";
  hint?: string | null;
};

export function KfProviderListingActions({
  manageHref,
  manageLabel,
  listingId,
  displayName,
  shareEnabled,
  layout = "inline",
  hint = null,
}: KfProviderListingActionsProps) {
  const toast = useKfToast();
  const [sharing, setSharing] = useState(false);

  const onShare = useCallback(async () => {
    if (!listingId || !shareEnabled) return;
    setSharing(true);
    try {
      const result = await shareProviderListing({
        listingId,
        displayName: displayName ?? "My listing",
        origin: window.location.origin,
        audience: "provider",
      });
      if (result.mode === "clipboard") {
        toast.success("Listing link copied — paste it in WhatsApp, SMS, or email.");
      } else if (result.mode === "native_share") {
        toast.success("Thanks for sharing your listing!");
      }
    } catch {
      toast.error("Could not share your listing. Try again.");
    } finally {
      setSharing(false);
    }
  }, [displayName, listingId, shareEnabled, toast]);

  const layoutClass =
    layout === "hero" ? "kf-provider-listing-actions--hero" : "kf-provider-listing-actions--inline";

  return (
    <div className={`kf-provider-listing-actions ${layoutClass}`}>
      <Link
        href={manageHref}
        className="kf-provider-action-btn kf-provider-action-btn--manage"
      >
        <PlusCircle className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
        {manageLabel}
      </Link>
      {listingId ? (
        <button
          type="button"
          className="kf-provider-action-btn kf-provider-action-btn--share"
          disabled={!shareEnabled || sharing}
          title={
            shareEnabled
              ? "Share your public listing link"
              : "Publish your listing to share it with customers"
          }
          onClick={() => void onShare()}
        >
          <Share2 className="h-[1.125rem] w-[1.125rem] shrink-0" aria-hidden />
          {sharing ? "Opening share…" : "Share your listing"}
        </button>
      ) : null}
      {hint ? <p className="kf-provider-listing-actions-hint">{hint}</p> : null}
      {listingId && !shareEnabled ? (
        <p className="kf-provider-listing-actions-hint" role="status">
          Share unlocks once your listing is published and approved.
        </p>
      ) : null}
    </div>
  );
}
