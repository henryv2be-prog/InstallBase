"use client";

import { useTransition } from "react";
import { Loader2, ShieldCheck } from "lucide-react";
import { kfRegisterProviderWithListing, kfUpsertListing } from "@/lib/kasifind/actions";
import { clearGuestListingDraft } from "@/lib/kasifind/guest-listing-draft";
import {
  attachGuestPendingPhotos,
  type GuestPendingPhotos,
} from "@/lib/kasifind/guest-listing-pending-photos";
import { useKfToast } from "@/components/kasifind/kf-toast";

export function KfGuestListingRegisterPanel({
  formRef,
  pendingPhotos,
  publishIntent,
  onCancel,
  onComplete,
}: {
  formRef: React.RefObject<HTMLFormElement | null>;
  pendingPhotos?: GuestPendingPhotos;
  publishIntent: boolean;
  onCancel: () => void;
  onComplete: (result: { listingId: string; published: boolean }) => void;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useKfToast();

  return (
    <div className="kf-card space-y-4 p-5">
      <div className="flex items-start gap-2 text-sm text-[var(--kf-muted)]">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
        <p>
          Create a free account to {publishIntent ? "publish your listing" : "save your draft"} — one
          listing per email.
        </p>
      </div>
      <div>
        <label className="kf-label" htmlFor="kf-guest-name">
          Your name
        </label>
        <input id="kf-guest-name" name="guestName" className="kf-input" autoComplete="name" />
      </div>
      <div>
        <label className="kf-label" htmlFor="kf-guest-email">
          Email
        </label>
        <input
          id="kf-guest-email"
          name="guestEmail"
          type="email"
          required
          className="kf-input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="kf-label" htmlFor="kf-guest-password">
          Password
        </label>
        <input
          id="kf-guest-password"
          name="guestPassword"
          type="password"
          required
          minLength={8}
          className="kf-input"
          autoComplete="new-password"
        />
        <p className="kf-help">At least 8 characters.</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button type="button" className="kf-btn kf-btn-outline flex-1" disabled={pending} onClick={onCancel}>
          Back
        </button>
        <button
          type="button"
          disabled={pending}
          className="kf-btn kf-btn-primary flex-1"
          onClick={() => {
          const form = formRef.current;
          if (!form) return;
          for (let step = 0; step <= 2; step += 1) {
            const panel = form.querySelector(`[data-wizard-step="${step}"]`);
            if (!panel) continue;
            const fields = panel.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
              "input:not([type=hidden]):not([type=file]), textarea"
            );
            for (const field of fields) {
              if (!field.checkValidity()) {
                field.reportValidity();
                return;
              }
            }
          }
          const guestName = (document.getElementById("kf-guest-name") as HTMLInputElement | null)?.value ?? "";
          const guestEmail = (document.getElementById("kf-guest-email") as HTMLInputElement | null)?.value?.trim();
          const guestPassword = (document.getElementById("kf-guest-password") as HTMLInputElement | null)?.value;
          if (!guestEmail || !guestPassword) {
            toast.error("Enter your email and password to continue.");
            return;
          }

          startTransition(async () => {
            const formData = new FormData(form);
            formData.set("publish", "false");
            formData.set("guestName", guestName);
            formData.set("guestEmail", guestEmail);
            formData.set("guestPassword", guestPassword);
            const result = await kfRegisterProviderWithListing(formData);
            if ("error" in result && result.error) {
              toast.error(result.error);
              return;
            }
            const listingId =
              "listingId" in result && typeof result.listingId === "string" ? result.listingId : null;
            if (!listingId) {
              toast.error("Could not create your listing — try again.");
              return;
            }
            if (pendingPhotos) {
              const attach = await attachGuestPendingPhotos(pendingPhotos);
              if (attach.error) {
                toast.error(attach.error);
                return;
              }
            }
            let published = false;
            if (publishIntent) {
              const publishForm = new FormData(form);
              publishForm.set("publish", "true");
              const upsert = await kfUpsertListing(publishForm);
              if ("error" in upsert && upsert.error) {
                toast.error(upsert.error);
                return;
              }
              published = true;
            }
            clearGuestListingDraft();
            onComplete({ listingId, published });
          });
        }}
      >
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            {publishIntent ? "Publishing…" : "Saving…"}
          </>
        ) : publishIntent ? (
          "Create account & publish"
        ) : (
          "Create account & save draft"
        )}
      </button>
      </div>
    </div>
  );
}
