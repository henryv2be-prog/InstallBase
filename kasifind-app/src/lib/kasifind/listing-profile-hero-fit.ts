/** Wide photos use cover; square logos and tall portraits use contain so nothing is awkwardly cropped. */
export function fitModeForProfileHero(ratio: number): "cover" | "contain" {
  if (!Number.isFinite(ratio) || ratio <= 0) return "contain";
  return ratio >= 1.2 ? "cover" : "contain";
}