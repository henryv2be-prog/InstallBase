"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { kfSubmitReview } from "@/lib/kasifind/actions";

export function KfReviewForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  return (
    <form
      className="mt-6 border-t border-[var(--kf-border)] pt-6"
      action={(formData) => {
        startTransition(async () => {
          const result = await kfSubmitReview(formData);
          setMessage(
            "error" in result && result.error ? result.error : "Thanks — your review was posted."
          );
        });
      }}
    >
      <input type="hidden" name="listingId" value={listingId} />
      <h3 className="text-sm font-bold text-[var(--kf-charcoal)]">Leave a review</h3>
      <div className="mt-3 space-y-3">
        <div>
          <label className="kf-label" htmlFor="kf-review-name">
            Your name (optional)
          </label>
          <input id="kf-review-name" name="authorName" className="kf-input" />
        </div>
        <div>
          <label className="kf-label" htmlFor="kf-rating">
            Rating
          </label>
          <select id="kf-rating" name="rating" required className="kf-input">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="kf-label" htmlFor="kf-review-body">
            Review
          </label>
          <textarea
            id="kf-review-body"
            name="body"
            required
            minLength={8}
            rows={3}
            className="kf-input min-h-[5rem] resize-y"
            placeholder="Share your experience (minimum 8 characters)"
          />
        </div>
      </div>
      <button type="submit" disabled={pending} className="kf-btn kf-btn-primary mt-4">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Posting…
          </>
        ) : (
          "Post review"
        )}
      </button>
      {message ? <p className="kf-help mt-2">{message}</p> : null}
    </form>
  );
}
