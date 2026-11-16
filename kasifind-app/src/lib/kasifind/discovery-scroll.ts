/** Remember homepage scroll when opening a listing so back restores position. */

const KEY = "kf_discovery_scroll_v1";
const RESTORE_DELAYS_MS = [0, 50, 150, 400, 800, 1200, 1800] as const;
const SCROLL_TOLERANCE_PX = 72;

export type DiscoveryScrollBookmark = {
  y: number;
  listingId: string;
};

function normalizeBookmark(value: unknown): DiscoveryScrollBookmark | null {
  if (!value || typeof value !== "object") return null;
  const o = value as Record<string, unknown>;
  if (typeof o.listingId !== "string" || !o.listingId.trim()) return null;
  if (typeof o.y !== "number" || !Number.isFinite(o.y) || o.y < 0) return null;
  return { listingId: o.listingId, y: Math.round(o.y) };
}

export function saveDiscoveryScroll(listingId: string): void {
  if (typeof window === "undefined") return;
  try {
    const payload: DiscoveryScrollBookmark = {
      listingId,
      y: Math.max(0, Math.round(window.scrollY)),
    };
    sessionStorage.setItem(KEY, JSON.stringify(payload));
  } catch {
    /* ignore */
  }
}

/** Read pending scroll bookmark without clearing it. */
export function readDiscoveryScroll(): DiscoveryScrollBookmark | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    return normalizeBookmark(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function clearDiscoveryScroll(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export function consumeDiscoveryScroll(): DiscoveryScrollBookmark | null {
  const bookmark = readDiscoveryScroll();
  if (bookmark) clearDiscoveryScroll();
  return bookmark;
}

function findListingCard(listingId: string): HTMLElement | null {
  return (
    Array.from(document.querySelectorAll<HTMLElement>("[data-kf-listing-id]")).find(
      (el) => el.getAttribute("data-kf-listing-id") === listingId
    ) ?? null
  );
}

export function discoveryScrollLooksRestored(
  bookmark: DiscoveryScrollBookmark
): boolean {
  if (typeof window === "undefined") return false;
  if (Math.abs(window.scrollY - bookmark.y) <= SCROLL_TOLERANCE_PX) return true;
  const card = findListingCard(bookmark.listingId);
  if (!card) return false;
  const rect = card.getBoundingClientRect();
  const viewH = window.innerHeight || document.documentElement.clientHeight;
  return rect.top >= -SCROLL_TOLERANCE_PX && rect.bottom <= viewH + SCROLL_TOLERANCE_PX;
}

const SCROLL_TOP_DELAYS_MS = [0, 50, 150, 400, 800] as const;
export const DISCOVERY_RESULTS_ANCHOR_ID = "kf-discovery-results";
const RESULTS_SCROLL_GAP_PX = 8;

export function resolveDiscoveryScrollTarget(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  const firstListing = document.querySelector<HTMLElement>("[data-kf-listing-id]");
  if (firstListing) return firstListing;
  return document.getElementById(DISCOVERY_RESULTS_ANCHOR_ID);
}

/** Y offset so the first result (or results heading) sits just under the header. */
export function measureDiscoveryResultsScrollY(): number {
  if (typeof window === "undefined") return 0;
  const el = resolveDiscoveryScrollTarget();
  if (!el) return 0;
  const root = document.documentElement;
  const headerRem = parseFloat(getComputedStyle(root).getPropertyValue("--kf-header-h")) || 3.25;
  const headerPx = headerRem * (parseFloat(getComputedStyle(root).fontSize) || 16);
  const rect = el.getBoundingClientRect();
  return Math.max(0, Math.round(rect.top + window.scrollY - headerPx - RESULTS_SCROLL_GAP_PX));
}

function scrollDiscoveryToResultsOnce(): void {
  const y = measureDiscoveryResultsScrollY();
  window.scrollTo({ top: y, left: 0, behavior: "auto" });
}

/** Scroll to the first listing (or results block) after filter/search updates. */
export function scrollDiscoveryToTop(): void {
  if (typeof window === "undefined") return;
  scrollDiscoveryToResultsOnce();
  window.requestAnimationFrame(scrollDiscoveryToResultsOnce);
}

/** Keep scroll on results while layout settles (beats late restore/layout shifts). */
export function scheduleScrollDiscoveryToTop(): () => void {
  if (typeof window === "undefined") return () => undefined;

  const canSetRestoration =
    typeof history !== "undefined" && "scrollRestoration" in history;
  const prevRestoration = canSetRestoration ? history.scrollRestoration : null;
  if (canSetRestoration) history.scrollRestoration = "manual";

  const timers: number[] = [];
  let done = false;

  const scrollToResults = () => {
    if (done) return;
    scrollDiscoveryToResultsOnce();
  };

  scrollToResults();
  window.requestAnimationFrame(scrollToResults);

  for (const delay of SCROLL_TOP_DELAYS_MS) {
    timers.push(window.setTimeout(scrollToResults, delay));
  }

  return () => {
    done = true;
    for (const id of timers) window.clearTimeout(id);
    if (canSetRestoration && prevRestoration !== null) {
      history.scrollRestoration = prevRestoration;
    }
  };
}

export function applyDiscoveryScroll(bookmark: DiscoveryScrollBookmark): void {
  if (typeof window === "undefined") return;

  const scrollToY = () => {
    window.scrollTo({ top: bookmark.y, left: 0, behavior: "auto" });
  };

  scrollToY();
  window.requestAnimationFrame(() => {
    scrollToY();
    const card = findListingCard(bookmark.listingId);
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < -SCROLL_TOLERANCE_PX || rect.bottom > viewH + SCROLL_TOLERANCE_PX) {
      card.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  });
}

type RestoreOpts = {
  bookmark: DiscoveryScrollBookmark;
  isReady: () => boolean;
  onRestored?: () => void;
};

/** Retry scroll restore until search results have painted or attempts are exhausted. */
export function scheduleDiscoveryScrollRestore({
  bookmark,
  isReady,
  onRestored,
}: RestoreOpts): () => void {
  if (typeof window === "undefined") return () => undefined;

  const prevRestoration = history.scrollRestoration;
  history.scrollRestoration = "manual";

  const timers: number[] = [];
  let done = false;

  const attempt = () => {
    if (done) return;
    if (!isReady()) return;
    applyDiscoveryScroll(bookmark);
    if (discoveryScrollLooksRestored(bookmark)) {
      done = true;
      clearDiscoveryScroll();
      onRestored?.();
    }
  };

  for (const delay of RESTORE_DELAYS_MS) {
    timers.push(window.setTimeout(attempt, delay));
  }

  const onPageShow = () => attempt();
  window.addEventListener("pageshow", onPageShow);

  return () => {
    done = true;
    for (const id of timers) window.clearTimeout(id);
    window.removeEventListener("pageshow", onPageShow);
    history.scrollRestoration = prevRestoration;
  };
}