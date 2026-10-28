"use client";

import { useState, useTransition } from "react";
import { kfSubmitReview } from "@/lib/kasifind/actions";

export function KfReviewForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-6 space-y-3 border-t border-black/10 pt-4"
      action={(formData) => {
        startTransition(async () => {
          const result = await kfSubmitReview(formData);
          setMessage("error" in result && result.error ? result.error : "Thanks — your review was posted.");
        });
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <h3 className="font-semibold">Leave a review</h3>
      <label className="block text-sm">
        Your name (optional)
        <input name="authorName" className="mt-1 w-full rounded-lg border px-3 py-2" />
      </label>
      <label className="block text-sm">
        Rating
        <select name="rating" required className="mt-1 w-full rounded-lg border px-3 py-2">
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} stars
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        Review
        <textarea
          name="body"
          required
          minLength={8}
          rows={3}
          className="mt-1 w-full rounded-lg border px-3 py-2"
          placeholder="Share your experience (minimum 8 characters)"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="kf-btn-primary rounded-xl px-4 py-2 text-sm disabled:opacity-60"
      >
        {pending ? "Posting…" : "Post review"}
      </button>
      {message && <p className="text-sm text-[var(--kf-muted)]">{message}</p>}
    </form>
  );
}
