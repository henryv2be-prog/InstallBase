import { cn } from "@/lib/utils";

export const IB_MARK_VIEWBOX = "0 0 56 40";

/** Cyan accent for the i-dot — reads on the blue gradient like the reference mark. */
export const IB_MARK_ACCENT = "#67e8f9";

interface IbMarkProps {
  className?: string;
  /** White silhouette for notification badges on transparent backgrounds. */
  monochrome?: boolean;
}

/**
 * Stylized iB monogram: lowercase i with accent dot + geometric B,
 * inspired by the InstallBase reference mark.
 */
export function IbMark({ className, monochrome = false }: IbMarkProps) {
  const letterColor = "currentColor";
  const dotColor = monochrome ? letterColor : IB_MARK_ACCENT;

  return (
    <svg
      viewBox={IB_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("block", className)}
      aria-hidden
    >
      <circle cx="9" cy="8" r="4.5" fill={dotColor} />
      <rect x="6.25" y="16" width="5.5" height="22" rx="2.75" fill={letterColor} />
      <path
        fill={letterColor}
        d="M22 4h14c6.2 0 10.5 3.8 10.5 9.2 0 3.4-1.8 6.2-4.8 7.6 3.4 1.3 5.8 4.4 5.8 8.4 0 5.8-4.6 9.8-11.3 9.8H22V4zm5.2 5.2v7.6h7.4c2.6 0 4.2-1.6 4.2-3.8s-1.6-3.8-4.2-3.8h-7.4zm0 12.8v9.6h8.2c3.2 0 5.4-2 5.4-4.8s-2.2-4.8-5.4-4.8h-8.2z"
      />
    </svg>
  );
}
