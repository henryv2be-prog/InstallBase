import { Star } from "lucide-react";

type Props = {
  averageRating: number;
  reviewCount: number;
  /** Search cards and compact rows */
  variant?: "card" | "hero";
  /** Profile header copy */
  showUnverifiedNote?: boolean;
};

export function KfListingRatingDisplay({
  averageRating,
  reviewCount,
  variant = "card",
  showUnverifiedNote = false,
}: Props) {
  const label = `${averageRating.toFixed(1)} out of 5 stars, ${reviewCount} review${
    reviewCount === 1 ? "" : "s"
  }`;

  return (
    <div
      className={`kf-rating-highlight${variant === "hero" ? " kf-rating-highlight--hero" : ""}`}
      role="img"
      aria-label={label}
    >
      <Star className="kf-rating-highlight-star" aria-hidden />
      <span className="kf-rating-score">{averageRating.toFixed(1)}</span>
      <span className="kf-rating-outof" aria-hidden>
        /5
      </span>
      <span className="kf-rating-count">
        {reviewCount} review{reviewCount === 1 ? "" : "s"}
        {showUnverifiedNote ? " · unverified" : ""}
      </span>
    </div>
  );
}

export function KfProviderRatingFloat({
  averageRating,
  reviewCount,
}: {
  averageRating: number;
  reviewCount: number;
}) {
  return (
    <span
      className="kf-provider-rating-float"
      aria-label={`${averageRating.toFixed(1)} out of 5, ${reviewCount} reviews`}
    >
      <Star className="h-3.5 w-3.5 fill-[var(--kf-yellow)] text-[var(--kf-yellow)]" aria-hidden />
      <span className="kf-provider-rating-float-score">{averageRating.toFixed(1)}</span>
    </span>
  );
}
