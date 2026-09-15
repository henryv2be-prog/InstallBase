import { cn } from "@/lib/utils";

interface AppIconProps {
  size?: number;
  className?: string;
}

/** Squircle corner radius matching iOS/Android app-icon proportions (~22%). */
const SQUIRCLE_RX = 112;

/**
 * Inline SVG app icon for crisp rendering in the UI.
 * PNG variants in /public/icons are generated from the same artwork for PWA/favicon/push.
 */
export function AppIcon({ size = 36, className }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="ib-bg" x1="64" y1="48" x2="448" y2="464" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1d4ed8" />
          <stop offset="42%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#22d3ee" />
        </linearGradient>
        <linearGradient id="ib-sheen" x1="96" y1="64" x2="320" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="512" height="512" rx={SQUIRCLE_RX} fill="url(#ib-bg)" />
      <rect width="512" height="512" rx={SQUIRCLE_RX} fill="url(#ib-sheen)" />
      <g transform="translate(116 156) scale(5)">
        <circle cx="9" cy="8" r="4.5" fill="#67e8f9" />
        <rect x="6.25" y="16" width="5.5" height="22" rx="2.75" fill="#ffffff" />
        <path
          fill="#ffffff"
          d="M22 4h14c6.2 0 10.5 3.8 10.5 9.2 0 3.4-1.8 6.2-4.8 7.6 3.4 1.3 5.8 4.4 5.8 8.4 0 5.8-4.6 9.8-11.3 9.8H22V4zm5.2 5.2v7.6h7.4c2.6 0 4.2-1.6 4.2-3.8s-1.6-3.8-4.2-3.8h-7.4zm0 12.8v9.6h8.2c3.2 0 5.4-2 5.4-4.8s-2.2-4.8-5.4-4.8h-8.2z"
        />
      </g>
    </svg>
  );
}
