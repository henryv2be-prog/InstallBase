const STORAGE_KEY = "ib-ad-viewer-key";

export function getOrCreateViewerKey(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing) return existing;
    const key = crypto.randomUUID();
    sessionStorage.setItem(STORAGE_KEY, key);
    return key;
  } catch {
    return "";
  }
}

export function getDeviceType(): "mobile" | "desktop" | "tablet" {
  if (typeof window === "undefined") return "desktop";
  const width = window.innerWidth;
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}
