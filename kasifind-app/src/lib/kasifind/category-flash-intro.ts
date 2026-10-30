export const CATEGORY_FLASH_SESSION_KEY = "kf-category-flash-v2";

/** ~170ms × 10 frames ≈ 1.7s (under 2s cap). */
export const CATEGORY_FLASH_FRAME_MS = 170;

export type CategoryFlashSlide = {
  id: string;
  src: string;
  label: string;
};

export const CATEGORY_FLASH_SLIDES: CategoryFlashSlide[] = [
  { id: "security", src: "/intro/security-gates.jpg", label: "Security gates & burglar bars" },
  { id: "aluminium", src: "/intro/aluminium-windows.jpg", label: "Aluminium windows" },
  { id: "plumbing", src: "/intro/plumbing.jpg", label: "Plumbing" },
  { id: "electrical", src: "/intro/electrical.jpg", label: "Electrical services" },
  { id: "automotive", src: "/intro/car-repairs.jpg", label: "Car repairs" },
  { id: "gas", src: "/intro/gas.jpg", label: "Gas suppliers" },
  { id: "garden", src: "/intro/gardening.jpg", label: "Gardening & landscaping" },
  { id: "hair", src: "/intro/hair-barber.jpg", label: "Hairdressers & barbers" },
  { id: "building", src: "/intro/building.jpg", label: "Building & construction" },
  { id: "food", src: "/intro/food-catering.jpg", label: "Food & catering" },
];

export function shouldPlayCategoryFlashIntro(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  try {
    return sessionStorage.getItem(CATEGORY_FLASH_SESSION_KEY) !== "1";
  } catch {
    return false;
  }
}

export function markCategoryFlashIntroPlayed(): void {
  try {
    sessionStorage.setItem(CATEGORY_FLASH_SESSION_KEY, "1");
  } catch {
    /* ignore */
  }
}

function loadSlideImage(src: string, attempt: number): Promise<boolean> {
  return new Promise((resolve) => {
    const img = new Image();
    const timeout = window.setTimeout(() => resolve(false), 12_000);
    img.onload = () => {
      window.clearTimeout(timeout);
      void img.decode?.().then(() => resolve(true)).catch(() => resolve(true));
    };
    img.onerror = () => {
      window.clearTimeout(timeout);
      resolve(false);
    };
    const bust = attempt > 0 ? `${src}${src.includes("?") ? "&" : "?"}retry=${attempt}` : src;
    img.src = bust;
  });
}

/** Returns true only when every slide image loaded (no blank frames). */
export async function preloadCategoryFlashImages(
  slides: CategoryFlashSlide[] = CATEGORY_FLASH_SLIDES
): Promise<boolean> {
  if (typeof window === "undefined") return true;
  const results = await Promise.all(
    slides.map(async (slide) => {
      if (await loadSlideImage(slide.src, 0)) return true;
      return loadSlideImage(slide.src, 1);
    })
  );
  return results.every(Boolean);
}
