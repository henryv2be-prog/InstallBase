import {
  formatDistanceKmClient,
  hasValidDistanceKm,
} from "@/components/kasifind/format-distance";
import { KfCrowFliesIcon } from "@/components/kasifind/kf-crow-flies-icon";

const CROW_FLIES_TITLE = "As the crow flies – straight-line distance";

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
      <span className={`kf-provider-distance-badge${className ? ` ${className}` : ""}`} title={CROW_FLIES_TITLE}>
        <KfCrowFliesIcon className="kf-crow-flies-icon kf-provider-distance-badge-icon" />
        {text}
      </span>
    );
  }

  return (
    <span
      className={`kf-crow-flies-distance kf-crow-flies-distance--inline inline-flex items-center gap-0.5${className ? ` ${className}` : ""}`}
      title={CROW_FLIES_TITLE}
    >
      <KfCrowFliesIcon className="kf-crow-flies-icon" />
      <span>{text}</span>
    </span>
  );
}