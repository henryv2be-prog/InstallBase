"use client";

import { useState, useTransition } from "react";
import { kfReportListing } from "@/lib/kasifind/admin-actions";
import { useKfToast } from "@/components/kasifind/kf-toast";

export function KfReportForm({ listingId }: { listingId: string }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const toast = useKfToast();

  if (!open) {
    return (
      <button
        type="button"
        className="text-xs text-[var(--kf-muted)] underline"
        onClick={() => setOpen(true)}
      >
        Report this listing
      </button>
    );
  }

  return (
    <form
      className="kf-card mt-4 rounded-xl p-4"
      action={(formData) => {
        startTransition(async () => {
          const result = await kfReportListing(formData);
          if ("error" in result) toast.error(result.error);
          else toast.success("Report submitted. Thank you.");
        });
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <h3 className="font-semibold">Report listing</h3>
      <textarea
        name="reason"
        required
        minLength={4}
        rows={2}
        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="Why is this listing inappropriate?"
      />
      <textarea
        name="details"
        rows={2}
        className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
        placeholder="Optional details"
      />
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-lg border px-3 py-1.5 text-sm disabled:opacity-60"
      >
        Submit report
      </button>
    </form>
  );
}
