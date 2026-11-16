/** Remember homepage scroll when opening a listing so back restores position. */

const KEY = "kf_discovery_scroll_v1";

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

export function consumeDiscoveryScroll(): DiscoveryScrollBookmark | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    sessionStorage.removeItem(KEY);
    if (!raw) return null;
    return normalizeBookmark(JSON.parse(raw) as unknown);
  } catch {
    return null;
  }
}

export function applyDiscoveryScroll(bookmark: DiscoveryScrollBookmark): void {
  if (typeof window === "undefined") return;

  const scrollToY = () => {
    window.scrollTo({ top: bookmark.y, left: 0, behavior: "auto" });
  };

  scrollToY();
  window.requestAnimationFrame(() => {
    scrollToY();
    const card = Array.from(document.querySelectorAll<HTMLElement>("[data-kf-listing-id]")).find(
      (el) => el.getAttribute("data-kf-listing-id") === bookmark.listingId
    );
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const viewH = window.innerHeight || document.documentElement.clientHeight;
    if (rect.top < 0 || rect.bottom > viewH) {
      card.scrollIntoView({ block: "nearest", behavior: "auto" });
    }
  });
}