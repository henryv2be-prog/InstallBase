export const CATEGORY_FLASH_SESSION_KEY = "kf-category-flash-v5";

export const CATEGORY_FLASH_MIN_SLIDES = 1;

/** ~4.45s cinematic sequence (montage + hero + landing fade). */
export const CINEMATIC_TOTAL_MS = 4450;
export const CINEMATIC_MONTAGE_MS = 1700;
export const CINEMATIC_HERO_MS = 750;
export const CINEMATIC_FADE_MS = 2000;

export function cinematicPhaseDurations(montageFrameCount: number): {
  heroMs: number;
  fadeMs: number;
} {
  if (montageFrameCount > 0) {
    return { heroMs: CINEMATIC_HERO_MS, fadeMs: CINEMATIC_FADE_MS };
  }
  return { heroMs: 1800, fadeMs: 2200 };
}

export type CategoryFlashSlide = {
  id: string;
  src: string;
  label: string;
  listingId: string;
  providerName?: string;
  /** Final dramatic frame with KasiFind branding. */
  isHero?: boolean;
};

export type CinematicFrameStep = {
  slideIndex: number;
  durationMs: number;
};

/**
 * Montage dwell times that sum to {@link CINEMATIC_MONTAGE_MS} — slower cuts first, faster later.
 */
export function buildCinematicMontageSchedule(montageFrameCount: number): CinematicFrameStep[] {
  if (montageFrameCount <= 0) return [];

  const weights = Array.from({ length: montageFrameCount }, (_, i) => {
    const t = montageFrameCount === 1 ? 0 : i / (montageFrameCount - 1);
    return 1.15 - t * 0.82;
  });
  const weightSum = weights.reduce((a, b) => a + b, 0);
  const durations = weights.map((w) =>
    Math.max(48, Math.round((w / weightSum) * CINEMATIC_MONTAGE_MS))
  );
  const drift = CINEMATIC_MONTAGE_MS - durations.reduce((a, b) => a + b, 0);
  durations[durations.length - 1] = Math.max(48, durations[durations.length - 1]! + drift);

  return durations.map((durationMs, slideIndex) => ({ slideIndex, durationMs }));
}

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

/** Montage indices exclude hero; hero is always last slide when marked. */
export function splitMontageAndHero(slides: CategoryFlashSlide[]): {
  montageSlides: CategoryFlashSlide[];
  heroSlide: CategoryFlashSlide | null;
} {
  if (slides.length === 0) return { montageSlides: [], heroSlide: null };
  const heroIndex = slides.findIndex((s) => s.isHero);
  if (heroIndex === -1) {
    if (slides.length === 1) return { montageSlides: [], heroSlide: slides[0]! };
    return {
      montageSlides: slides.slice(0, -1),
      heroSlide: slides[slides.length - 1]!,
    };
  }
  return {
    montageSlides: slides.filter((_, i) => i !== heroIndex),
    heroSlide: slides[heroIndex]!,
  };
}
