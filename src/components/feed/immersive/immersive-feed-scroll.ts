/** Scroll the New look vertical feed scroller (Home / Explore watch). */

export const IMMERSIVE_FEED_RESET_EVENT = "ib-immersive-feed-reset";

export type ImmersiveFeedResetDetail = { behavior?: ScrollBehavior };

export function requestImmersiveFeedReset(behavior: ScrollBehavior = "instant") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(IMMERSIVE_FEED_RESET_EVENT, { detail: { behavior } })
  );
}

function scrollScrollerElement(behavior: ScrollBehavior) {
  const el = document.querySelector(".immersive-feed-scroll");
  if (!(el instanceof HTMLElement)) return;
  el.scrollTo({ top: 0, behavior });
  if (behavior !== "instant") {
    el.scrollTop = 0;
  }
}

/** Reset feed scroll + active slide (via ImmersiveFeed listener). */
export function scrollImmersiveFeedToTop(behavior: ScrollBehavior = "instant") {
  requestImmersiveFeedReset(behavior);
  scrollScrollerElement(behavior);
  requestAnimationFrame(() => scrollScrollerElement("instant"));
}
