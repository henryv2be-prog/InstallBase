import { ImageResponse } from "next/og";
import { IB_MARK_ACCENT, IB_MARK_VIEWBOX } from "@/components/ui/ib-mark";

const BLUE_GRADIENT = "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)";

function IbMarkSvg({
  width,
  height,
  monochrome = false,
}: {
  width: number;
  height: number;
  monochrome?: boolean;
}) {
  const dotColor = monochrome ? "#ffffff" : IB_MARK_ACCENT;

  return (
    <svg
      width={width}
      height={height}
      viewBox={IB_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="9" cy="8" r="4.5" fill={dotColor} />
      <rect x="6.25" y="16" width="5.5" height="22" rx="2.75" fill="#ffffff" />
      <path
        fill="#ffffff"
        d="M22 4h14c6.2 0 10.5 3.8 10.5 9.2 0 3.4-1.8 6.2-4.8 7.6 3.4 1.3 5.8 4.4 5.8 8.4 0 5.8-4.6 9.8-11.3 9.8H22V4zm5.2 5.2v7.6h7.4c2.6 0 4.2-1.6 4.2-3.8s-1.6-3.8-4.2-3.8h-7.4zm0 12.8v9.6h8.2c3.2 0 5.4-2 5.4-4.8s-2.2-4.8-5.4-4.8h-8.2z"
      />
    </svg>
  );
}

/**
 * Full-bleed blue iB mark. Maskable variants keep the monogram inside the
 * 80% safe zone so Android circle/squircle crops never clip it.
 */
export function renderAppIcon(size: number, maskable = false) {
  const markWidth = Math.round(size * (maskable ? 0.56 : 0.62));
  const markHeight = Math.round(markWidth * (40 / 56));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: BLUE_GRADIENT,
        }}
      >
        <IbMarkSvg width={markWidth} height={markHeight} />
      </div>
    ),
    { width: size, height: size }
  );
}

/**
 * Android status-bar / notification badge: white silhouette on a transparent
 * background. Color PNGs are flattened to a solid white square.
 */
export function renderNotificationBadge(size = 96) {
  const markWidth = Math.round(size * 0.62);
  const markHeight = Math.round(markWidth * (40 / 56));

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "transparent",
        }}
      >
        <IbMarkSvg width={markWidth} height={markHeight} monochrome />
      </div>
    ),
    { width: size, height: size }
  );
}
