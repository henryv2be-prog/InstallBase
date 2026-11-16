/** Locks page scroll and blocks viewport pinch-zoom while a gallery lightbox is open. */

const HTML_CLASS = "kf-photo-lightbox-open";
const ZOOMABLE = ".kf-photo-lightbox-image-wrap--zoomable";

function touchDistance(touches: TouchList): number {
  if (touches.length < 2) return 0;
  const dx = touches[0]!.clientX - touches[1]!.clientX;
  const dy = touches[0]!.clientY - touches[1]!.clientY;
  return Math.hypot(dx, dy);
}

function isInsideZoomable(target: EventTarget | null): boolean {
  return target instanceof Element && Boolean(target.closest(ZOOMABLE));
}

export function bindPhotoLightboxPageLock() {
  const html = document.documentElement;
  const scrollY = window.scrollY;

  html.classList.add(HTML_CLASS);

  const prev = {
    overflow: document.body.style.overflow,
    position: document.body.style.position,
    top: document.body.style.top,
    width: document.body.style.width,
    left: document.body.style.left,
    right: document.body.style.right,
  };

  document.body.style.overflow = "hidden";
  document.body.style.position = "fixed";
  document.body.style.top = `-${scrollY}px`;
  document.body.style.left = "0";
  document.body.style.right = "0";
  document.body.style.width = "100%";

  const onTouchMove = (e: TouchEvent) => {
    if (e.touches.length < 2) return;
    if (!isInsideZoomable(e.target)) e.preventDefault();
  };

  /** iOS viewport zoom uses gesture events; block them while the lightbox is open. */
  const onGesture = (e: Event) => {
    e.preventDefault();
  };

  document.addEventListener("touchmove", onTouchMove, { passive: false });
  document.addEventListener("gesturestart", onGesture);
  document.addEventListener("gesturechange", onGesture);
  document.addEventListener("gestureend", onGesture);

  return () => {
    html.classList.remove(HTML_CLASS);
    document.body.style.overflow = prev.overflow;
    document.body.style.position = prev.position;
    document.body.style.top = prev.top;
    document.body.style.width = prev.width;
    document.body.style.left = prev.left;
    document.body.style.right = prev.right;
    window.scrollTo(0, scrollY);

    document.removeEventListener("touchmove", onTouchMove);
    document.removeEventListener("gesturestart", onGesture);
    document.removeEventListener("gesturechange", onGesture);
    document.removeEventListener("gestureend", onGesture);
  };
}

export function pinchDistanceFromTouches(touches: TouchList): number {
  return touchDistance(touches);
}