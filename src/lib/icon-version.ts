/** Bump when PWA / notification icon assets change (cache-busts immutable CDN/browser cache). */
export const ICON_VERSION = 13;

export function iconUrl(filename: string) {
  return `/icons/${filename}?v=${ICON_VERSION}`;
}
