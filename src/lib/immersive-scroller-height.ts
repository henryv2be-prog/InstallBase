/** Mobile tab bar — not the desktop `<nav>` hidden in the header. */
export function findMobileTabNav(shell: Element | null): HTMLElement | null {
  if (!shell) return null;
  const nav = shell.querySelector("nav.app-mobile-tab-nav");
  return nav instanceof HTMLElement ? nav : null;
}

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
  const nav = findMobileTabNav(shell);
  const navRect = nav?.getBoundingClientRect();
  const navTop =
    navRect && navRect.height > 0 && navRect.top > 0 ? navRect.top : null;
  return capImmersiveSlideHeightPx(
    scroller.clientHeight,
    scroller.getBoundingClientRect().top,
    navTop
  );
}
