/** Keep panned lightbox image edges reachable inside the viewport. */
export function clampLightboxPan(
  panX: number,
  panY: number,
  scale: number,
  viewportW: number,
  viewportH: number,
  imageW: number,
  imageH: number
): { x: number; y: number } {
  if (scale <= 1 || viewportW <= 0 || viewportH <= 0 || imageW <= 0 || imageH <= 0) {
    return { x: 0, y: 0 };
  }
  const scaledW = imageW * scale;
  const scaledH = imageH * scale;
  const maxX = Math.max(0, (scaledW - viewportW) / 2);
  const maxY = Math.max(0, (scaledH - viewportH) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, panX)),
    y: Math.min(maxY, Math.max(-maxY, panY)),
  };
}