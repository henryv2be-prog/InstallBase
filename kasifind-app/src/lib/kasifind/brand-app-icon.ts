/** Vector app icon — matches `.kf-brand-mark` (forest → orange gradient + pin). */

export const KF_APP_ICON_COLORS = {
  forest: "#0F4D3A",
  forestMid: "#157a5c",
  orange: "#FF8A00",
  yellow: "#F6C945",
  ivory: "#F9FAF7",
} as const;

const PIN_PATH =
  "M16 3c-5.2 0-9.5 4-9.5 9.1 0 6.8 7.2 13.2 9.1 15.1.4.4 1 .4 1.4 0 1.9-1.9 9.1-8.3 9.1-15.1C26.1 7 21.8 3 16 3Z";

/**
 * Square PNG/SVG app icon at `size`×`size`.
 * Background is full-bleed (no transparent corners — avoids white/black halos on launchers).
 */
export function buildKasiFindAppIconSvg(
  size: number,
  options?: { maskable?: boolean; gradientId?: string }
): string {
  const gradientId = options?.gradientId ?? "kf-app-grad";
  const markSize = size * (options?.maskable ? 0.44 : 0.55);
  const markOffset = (size - markSize) / 2;
  const { forest, forestMid, orange, yellow } = KF_APP_ICON_COLORS;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${forest}"/>
      <stop offset="52%" stop-color="${forestMid}"/>
      <stop offset="100%" stop-color="${orange}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#${gradientId})"/>
  <svg x="${markOffset}" y="${markOffset}" width="${markSize}" height="${markSize}" viewBox="0 0 32 32" fill="none">
    <path d="${PIN_PATH}" fill="#ffffff"/>
    <circle cx="16" cy="12.2" r="4.2" fill="${yellow}"/>
    <circle cx="16" cy="12.2" r="1.6" fill="${forest}"/>
  </svg>
</svg>`;
}
