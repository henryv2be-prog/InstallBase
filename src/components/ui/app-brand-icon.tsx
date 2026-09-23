"use client";

import { useId } from "react";
import { cn } from "@/lib/utils";
import {
  BRAND_GRADIENT,
  IB_MARK_ACCENT,
  IB_MARK_VIEWBOX,
} from "@/lib/brand-mark";

interface AppBrandIconProps {
  size?: number;
  className?: string;
}

/** In-app icon — same vector composition as generated PWA PNGs. */
export function AppBrandIcon({ size = 36, className }: AppBrandIconProps) {
  const uid = useId().replace(/:/g, "");
  const gradId = `ib-grad-${uid}`;
  const markW = size * 0.74;
  const markH = markW * (40 / 56);
  const x = (size - markW) / 2;
  const y = (size - markH) / 2;

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className={cn("shrink-0 rounded-xl", className)}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={BRAND_GRADIENT.from} />
          <stop offset="100%" stopColor={BRAND_GRADIENT.to} />
        </linearGradient>
      </defs>
      <rect width={size} height={size} fill={`url(#${gradId})`} />
      <svg x={x} y={y} width={markW} height={markH} viewBox={IB_MARK_VIEWBOX}>
        <circle cx="9" cy="8" r="4.5" fill={IB_MARK_ACCENT} />
        <rect x="6.25" y="16" width="5.5" height="22" rx="2.75" fill="#ffffff" />
        <path
          fill="#ffffff"
          d="M22 4h14c6.2 0 10.5 3.8 10.5 9.2 0 3.4-1.8 6.2-4.8 7.6 3.4 1.3 5.8 4.4 5.8 8.4 0 5.8-4.6 9.8-11.3 9.8H22V4zm5.2 5.2v7.6h7.4c2.6 0 4.2-1.6 4.2-3.8s-1.6-3.8-4.2-3.8h-7.4zm0 12.8v9.6h8.2c3.2 0 5.4-2 5.4-4.8s-2.2-4.8-5.4-4.8h-8.2z"
        />
      </svg>
    </svg>
  );
}
