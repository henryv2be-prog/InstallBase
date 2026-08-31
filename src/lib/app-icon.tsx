import { ImageResponse } from "next/og";

const BLUE_GRADIENT = "linear-gradient(135deg, #2563eb 0%, #06b6d4 100%)";

/**
 * Full-bleed blue IB mark. Maskable variants keep the letters inside the
 * 80% safe zone so Android circle/squircle crops never clip them — the
 * canvas itself stays blue with no dark inset/border.
 */
export function renderAppIcon(size: number, maskable = false) {
  const fontSize = Math.round(size * (size < 64 ? 0.54 : maskable ? 0.34 : 0.4));

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
          color: "white",
          fontSize,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        IB
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
          color: "#ffffff",
          fontSize: Math.round(size * 0.5),
          fontWeight: 800,
          letterSpacing: "-0.06em",
          fontFamily: "ui-sans-serif, system-ui, sans-serif",
        }}
      >
        IB
      </div>
    ),
    { width: size, height: size }
  );
}
