/** Mobile tab bar — not the desktop `<nav>` hidden in the header. */
export function findMobileTabNav(shell: Element | null): HTMLElement | null {
  if (!shell) return null;
  const nav = shell.querySelector("nav.app-mobile-tab-nav");
  return nav instanceof HTMLElement ? nav : null;
}

/** Cap scrollport height (legacy helper — prefer full-bleed slide measure). */
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

function viewportBottomPx(): number {
  const vv = window.visualViewport;
  if (vv) return vv.offsetTop + vv.height;
  return window.innerHeight;
}

/**
 * One slide = full column from scroller top through the glass nav zone (Reels-style).
 * UI overlays pad above the dock; media scrolls under the glass while swiping.
 */
/** Usable column height for /create (from flow root top to visual viewport bottom). */
export function measureCreateFlowHeightPx(root: HTMLElement): number {
  const top = root.getBoundingClientRect().top;
  return Math.floor(viewportBottomPx() - top);
}

export function measureImmersiveSlideHeightPx(scroller: HTMLElement): number {
  const top = scroller.getBoundingClientRect().top;
  const fullBleed = Math.floor(viewportBottomPx() - top);
  const client = scroller.clientHeight;
  if (fullBleed > 64 && client > 64) {
    /* Prefer the live scrollport when it already matches the visual viewport. */
    return Math.abs(client - fullBleed) <= 2 ? client : fullBleed;
  }
  if (fullBleed > 64) return fullBleed;
  return client;
}
