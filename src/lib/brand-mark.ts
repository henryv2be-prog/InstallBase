/** Shared vector iB mark — single source for in-app SVG and PNG generation. */

export const IB_MARK_VIEWBOX = "0 0 56 40";

export const IB_MARK_ACCENT = "#5eead4";

/** Brand gradient stops (matches reference app icon). */
export const BRAND_GRADIENT = {
  from: "#2563eb",
  to: "#06b6d4",
} as const;

const MARK_SCALE = 0.74;

function markTransform(canvas: number) {
  const markW = canvas * MARK_SCALE;
  const markH = markW * (40 / 56);
  const x = (canvas - markW) / 2;
  const y = (canvas - markH) / 2;
  return { markW, markH, x, y };
}

function ibMarkPaths({ monochrome = false }: { monochrome?: boolean } = {}) {
  const letter = "#ffffff";
  const dot = monochrome ? letter : IB_MARK_ACCENT;
  return `
    <circle cx="9" cy="8" r="4.5" fill="${dot}"/>
    <rect x="6.25" y="16" width="5.5" height="22" rx="2.75" fill="${letter}"/>
    <path fill="${letter}" d="M22 4h14c6.2 0 10.5 3.8 10.5 9.2 0 3.4-1.8 6.2-4.8 7.6 3.4 1.3 5.8 4.4 5.8 8.4 0 5.8-4.6 9.8-11.3 9.8H22V4zm5.2 5.2v7.6h7.4c2.6 0 4.2-1.6 4.2-3.8s-1.6-3.8-4.2-3.8h-7.4zm0 12.8v9.6h8.2c3.2 0 5.4-2 5.4-4.8s-2.2-4.8-5.4-4.8h-8.2z"/>
  `;
}

/** Full-bleed app icon SVG (square canvas, vector mark). */
export function buildAppIconSvg(size: number, gradientId = "ib-grad") {
  const { markW, markH, x, y } = markTransform(size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${BRAND_GRADIENT.from}"/>
      <stop offset="100%" stop-color="${BRAND_GRADIENT.to}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#${gradientId})"/>
  <svg x="${x}" y="${y}" width="${markW}" height="${markH}" viewBox="${IB_MARK_VIEWBOX}">
    ${ibMarkPaths()}
  </svg>
</svg>`;
}

/** White iB on transparent canvas for notification badge. */
export function buildNotificationBadgeSvg(size: number) {
  const { markW, markH, x, y } = markTransform(size);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <svg x="${x}" y="${y}" width="${markW}" height="${markH}" viewBox="${IB_MARK_VIEWBOX}">
    ${ibMarkPaths({ monochrome: true })}
  </svg>
</svg>`;
}
