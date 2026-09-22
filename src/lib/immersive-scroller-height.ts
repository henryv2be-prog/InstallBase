/** Cap scrollport height so slide overlays sit above the floating mobile nav. */
export function capImmersiveSlideHeightPx(
  scrollClientHeight: number,
  scrollTop: number,
  navTop: number | null | undefined
): number {
  let h = scrollClientHeight;
  if (navTop != null && Number.isFinite(navTop)) {
    const maxAboveNav = Math.floor(navTop - scrollTop);
    if (Number.isFinite(maxAboveNav) && maxAboveNav > 0) {
      h = Math.min(h, maxAboveNav);
    }
  }
  return h;
}

export function measureImmersiveSlideHeightPx(scroller: HTMLElement): number {
  const shell = scroller.closest(".app-shell-viewport-lock");
  const nav = shell?.querySelector("nav");
  const navTop = nav instanceof HTMLElement ? nav.getBoundingClientRect().top : null;
  return capImmersiveSlideHeightPx(
    scroller.clientHeight,
    scroller.getBoundingClientRect().top,
    navTop
  );
}
