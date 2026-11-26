import { Navigation } from "lucide-react";
import {
  formatDistanceKmClient,
  hasValidDistanceKm,
} from "@/components/kasifind/format-distance";
import { KfCrowFliesIcon } from "@/components/kasifind/kf-crow-flies-icon";

const CROW_FLIES_TITLE = "As the crow flies – straight-line distance";
const DISTANCE_FROM_SEARCH_TITLE = "Distance from your search area";

type Props = {
  km: number;
  /** Overlay badge on provider cards vs compact inline (nearby list). */
  variant?: "badge" | "inline";
  className?: string;
};

export function KfCrowFliesDistance({ km, variant = "badge", className = "" }: Props) {
  if (!hasValidDistanceKm(km)) return null;

  const text = formatDistanceKmClient(km);

  if (variant === "badge") {
    return (
      <span className={`kf-provider-distance-badge${className ? ` ${className}` : ""}`}>
        <span
          className="kf-provider-distance-badge-main inline-flex min-w-0 items-center gap-[0.3rem]"
          title={DISTANCE_FROM_SEARCH_TITLE}
        >
          <Navigation className="kf-provider-distance-badge-icon" aria-hidden />
          <span className="truncate">{text}</span>
        </span>
        <span className="kf-crow-flies-badge-mark" title={CROW_FLIES_TITLE}>
          <KfCrowFliesIcon className="kf-crow-flies-icon kf-crow-flies-icon--badge" />
        </span>
      </span>
    );
  }

  return (
    <span
      className={`kf-crow-flies-distance kf-crow-flies-distance--inline inline-flex items-center gap-0.5${className ? ` ${className}` : ""}`}
      title={CROW_FLIES_TITLE}
    >
      <KfCrowFliesIcon className="kf-crow-flies-icon kf-crow-flies-icon--inline" />
      <span>{text}</span>
    </span>
  );
}