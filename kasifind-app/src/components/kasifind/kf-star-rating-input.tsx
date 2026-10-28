"use client";

import { useId, useState } from "react";
import { Star } from "lucide-react";

const RATING_LABELS: Record<number, string> = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very good",
  5: "Excellent",
};

type Props = {
  name: string;
  required?: boolean;
  defaultValue?: number;
  disabled?: boolean;
};

export function KfStarRatingInput({
  name,
  required = true,
  defaultValue = 0,
  disabled = false,
}: Props) {
  const groupId = useId();
  const [value, setValue] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  const display = hover || value;
  const hint =
    display > 0 ? RATING_LABELS[display] : required ? "Tap a star to rate" : "Optional rating";

  return (
    <div className="kf-star-rating">
      <input
        type="hidden"
        name={name}
        value={value > 0 ? String(value) : ""}
        required={required && value < 1}
      />
      <div
        role="radiogroup"
        aria-labelledby={`${groupId}-label`}
        aria-describedby={`${groupId}-hint`}
        className="kf-star-rating-row"
        onMouseLeave={() => setHover(0)}
      >
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = star <= display;
          return (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} star${star === 1 ? "" : "s"} — ${RATING_LABELS[star]}`}
              disabled={disabled}
              className={`kf-star-rating-star${filled ? " kf-star-rating-star--filled" : ""}`}
              onMouseEnter={() => !disabled && setHover(star)}
              onFocus={() => !disabled && setHover(star)}
              onBlur={() => setHover(0)}
              onClick={() => !disabled && setValue(star)}
              onKeyDown={(e) => {
                if (disabled) return;
                if (e.key === "ArrowRight" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setValue((v) => Math.min(5, (v || 0) + 1));
                }
                if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
                  e.preventDefault();
                  setValue((v) => Math.max(1, (v || 2) - 1));
                }
              }}
            >
              <Star className="kf-star-rating-icon" aria-hidden />
            </button>
          );
        })}
      </div>
      <p id={`${groupId}-hint`} className="kf-star-rating-hint" aria-live="polite">
        {hint}
      </p>
      <span id={`${groupId}-label`} className="sr-only">
        Rating
      </span>
    </div>
  );
}
