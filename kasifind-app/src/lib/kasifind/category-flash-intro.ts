export const CATEGORY_FLASH_SESSION_KEY = "kf-category-flash-v1";

/** ~170ms × 10 frames ≈ 1.7s (under 2s cap). */
export const CATEGORY_FLASH_FRAME_MS = 170;

export type CategoryFlashSlide = {
  id: string;
  src: string;
  label: string;
};

export const CATEGORY_FLASH_SLIDES: CategoryFlashSlide[] = [
  { id: "security", src: "/intro/security-gates.svg", label: "Security gates & burglar bars" },
  { id: "aluminium", src: "/intro/aluminium-windows.svg", label: "Aluminium windows" },
  { id: "plumbing", src: "/intro/plumbing.svg", label: "Plumbing" },
  { id: "electrical", src: "/intro/electrical.svg", label: "Electrical services" },
  { id: "automotive", src: "/intro/car-repairs.svg", label: "Car repairs" },
  { id: "gas", src: "/intro/gas.svg", label: "Gas suppliers" },
  { id: "garden", src: "/intro/gardening.svg", label: "Gardening & landscaping" },
  { id: "hair", src: "/intro/hair-barber.svg", label: "Hairdressers & barbers" },
  { id: "building", src: "/intro/building.svg", label: "Building & construction" },
  { id: "food", src: "/intro/food-catering.svg", label: "Food & catering" },
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

export function preloadCategoryFlashImages(
  slides: CategoryFlashSlide[] = CATEGORY_FLASH_SLIDES
): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  return Promise.all(
    slides.map(
      (slide) =>
        new Promise<void>((resolve) => {
          const img = new Image();
          img.decoding = "async";
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = slide.src;
        })
    )
  ).then(() => undefined);
}
