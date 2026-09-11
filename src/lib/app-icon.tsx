import { ImageResponse } from "next/og";
import {
  B_PATH,
  B_PATH_D,
  IB_MARK_ACCENT,
  IB_MARK_VIEWBOX,
  I_DOT,
  I_STEM,
} from "@/components/ui/ib-mark";

const BLUE_GRADIENT = "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)";

const MARK_ASPECT = 46 / 50;

function IbMarkSvg({
  width,
  height,
  monochrome = false,
}: {
  width: number;
  height: number;
  monochrome?: boolean;
}) {
  const accentColor = monochrome ? "#ffffff" : IB_MARK_ACCENT;

  return (
    <svg
      width={width}
      height={height}
      viewBox={IB_MARK_VIEWBOX}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx={I_DOT.cx} cy={I_DOT.cy} r={I_DOT.r} fill={accentColor} />
      <rect
        x={I_STEM.x}
        y={I_STEM.y}
        width={I_STEM.w}
        height={I_STEM.h}
        rx={I_STEM.rx}
        fill={accentColor}
      />
      <path
        fill="#ffffff"
        fillRule={monochrome ? "nonzero" : "evenodd"}
        d={monochrome ? B_PATH : B_PATH_D}
      />
    </svg>
  );
}

/**
 * Full-bleed blue iB mark. Maskable variants keep the monogram inside the
 * 80% safe zone so Android circle/squircle crops never clip it.
 */
export function renderAppIcon(size: number, maskable = false) {
  const markWidth = Math.round(size * (maskable ? 0.68 : 0.76));
  const markHeight = Math.round(markWidth * MARK_ASPECT);

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
  const markWidth = Math.round(size * 0.84);
  const markHeight = Math.round(markWidth * MARK_ASPECT);

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
