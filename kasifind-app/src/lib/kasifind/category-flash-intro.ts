export const CATEGORY_FLASH_SESSION_KEY = "kf-category-flash-v3";

/** Minimum real listing photos required to run the intro. */
export const CATEGORY_FLASH_MIN_SLIDES = 3;

/** Target wall-clock time for the full intro (split evenly across slides). */
export const CATEGORY_FLASH_TOTAL_MS = 4000;

export function categoryFlashFrameMs(slideCount: number): number {
  if (slideCount <= 0) return 400;
  return Math.max(280, Math.floor(CATEGORY_FLASH_TOTAL_MS / slideCount));
}

export type CategoryFlashSlide = {
  id: string;
  src: string;
  label: string;
  /** Real provider on KasiFind (work photo from their listing). */
  providerName?: string;
};

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
export async function preloadCategoryFlashImages(slides: CategoryFlashSlide[]): Promise<boolean> {
  if (typeof window === "undefined") return true;
  if (slides.length === 0) return false;
  const results = await Promise.all(
    slides.map(async (slide) => {
      if (await loadSlideImage(slide.src, 0)) return true;
      return loadSlideImage(slide.src, 1);
    })
  );
  return results.every(Boolean);
}
