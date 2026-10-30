/** Relative weight when randomly picking intro listings (featured listings appear more often). */
export const CATEGORY_FLASH_FEATURED_WEIGHT = 5;
export const CATEGORY_FLASH_DEFAULT_WEIGHT = 1;

export type WeightedListingPick = {
  featured: boolean;
  workPhotoCount: number;
};

export function categoryFlashListingWeight(pick: WeightedListingPick): number {
  const base = pick.featured ? CATEGORY_FLASH_FEATURED_WEIGHT : CATEGORY_FLASH_DEFAULT_WEIGHT;
  return base + Math.min(pick.workPhotoCount, 6);
}

export function weightedRandomPick<T>(items: T[], weightOf: (item: T) => number): T | null {
  if (items.length === 0) return null;
  let total = 0;
  for (const item of items) {
    total += Math.max(0, weightOf(item));
  }
  if (total <= 0) return items[0] ?? null;

  let roll = Math.random() * total;
  for (const item of items) {
    roll -= Math.max(0, weightOf(item));
    if (roll <= 0) return item;
  }
  return items[items.length - 1] ?? null;
}

export function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}
