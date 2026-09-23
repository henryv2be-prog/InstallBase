/** Scroll the New look vertical feed scroller (Home / Explore watch). */
export function scrollImmersiveFeedToTop(behavior: ScrollBehavior = "auto") {
  const el = document.querySelector(".immersive-feed-scroll");
  if (el instanceof HTMLElement) {
    el.scrollTo({ top: 0, behavior });
  }
}
