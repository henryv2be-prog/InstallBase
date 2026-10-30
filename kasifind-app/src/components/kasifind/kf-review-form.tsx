"use client";

import { useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { kfSubmitReview } from "@/lib/kasifind/actions";
import { KfStarRatingInput } from "@/components/kasifind/kf-star-rating-input";
import { useKfToast } from "@/components/kasifind/kf-toast";

export function KfReviewForm({ listingId }: { listingId: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useKfToast();
  const [formKey, setFormKey] = useState(0);

  return (
    <div className="kf-review-compose mt-6">
      <h3 className="text-base font-bold tracking-tight text-[var(--kf-charcoal)]">
        Leave a review
      </h3>
      <p className="mt-1 text-xs text-[var(--kf-muted)]">
        Help others choose with an honest rating and a few words about your experience.
      </p>

      <form
        key={formKey}
        className="mt-4 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (pending) return;
          const formData = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await kfSubmitReview(formData);
            if ("error" in result && result.error) {
              toast.error(result.error);
            } else {
              toast.success("Thanks — your review was posted.");
              setFormKey((k) => k + 1);
            }
          });
        }}
      >
        <input type="hidden" name="listingId" value={listingId} />

        <fieldset className="space-y-2" disabled={pending}>
          <legend className="kf-label">Your rating</legend>
          <KfStarRatingInput name="rating" disabled={pending} />
        </fieldset>

        <div>
          <label className="kf-label" htmlFor="kf-review-name">
            Your name <span className="font-normal text-[var(--kf-muted-soft)]">(optional)</span>
          </label>
          <input
            id="kf-review-name"
            name="authorName"
            className="kf-input"
            placeholder="How should we show your name?"
            disabled={pending}
            autoComplete="name"
          />
        </div>

        <div>
          <label className="kf-label" htmlFor="kf-review-body">
            Your review
          </label>
          <textarea
            id="kf-review-body"
            name="body"
            required
            minLength={8}
            rows={4}
            className="kf-input min-h-[6rem] resize-y"
            placeholder="What went well? Would you recommend this provider?"
            disabled={pending}
          />
          <p className="kf-help">At least 8 characters.</p>
        </div>

        <button type="submit" disabled={pending} className="kf-btn kf-btn-primary w-full sm:w-auto">
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Posting…
            </>
          ) : (
            "Post review"
          )}
        </button>

      </form>
    </div>
  );
}
