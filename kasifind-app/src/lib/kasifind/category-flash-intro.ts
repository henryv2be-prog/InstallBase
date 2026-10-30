export const CATEGORY_FLASH_SESSION_KEY = "kf-category-flash-v4";

/** Minimum real listing photos required to run the intro (timing stretches to ~4s either way). */
export const CATEGORY_FLASH_MIN_SLIDES = 1;

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

async function slideImageLoads(slide: CategoryFlashSlide): Promise<boolean> {
  if (await loadSlideImage(slide.src, 0)) return true;
  return loadSlideImage(slide.src, 1);
}

/** Keeps slides whose images loaded; drops broken URLs instead of cancelling the whole intro. */
export async function preloadCategoryFlashImages(
  slides: CategoryFlashSlide[]
): Promise<CategoryFlashSlide[]> {
  if (typeof window === "undefined") return slides;
  if (slides.length === 0) return [];
  const loaded = await Promise.all(
    slides.map(async (slide) => ((await slideImageLoads(slide)) ? slide : null))
  );
  return loaded.filter((s): s is CategoryFlashSlide => s !== null);
}
