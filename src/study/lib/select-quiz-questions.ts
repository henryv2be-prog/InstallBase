/** How to bias question difficulty when building a quiz session. */
export type QuizPickProfile = "default" | "harder" | "easier";

export type QuizPoolQuestion = {
  id: string;
  difficulty: number;
};

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function targetDifficultyFromMastery(masteryPct: number | null | undefined): number {
  if (masteryPct == null || Number.isNaN(masteryPct)) return 3;
  return Math.min(5, Math.max(1, Math.round(masteryPct / 20)));
}

function byDistanceToTarget(a: QuizPoolQuestion, b: QuizPoolQuestion, target: number): number {
  return Math.abs(a.difficulty - target) - Math.abs(b.difficulty - target);
}

/**
 * Pick a quiz subset from a pool — deterministic size, adaptive difficulty when profile set.
 */
export function selectQuestionsForQuiz<T extends QuizPoolQuestion>(
  pool: T[],
  size: number,
  profile: QuizPickProfile,
  masteryPct?: number | null,
): T[] {
  if (pool.length === 0) return [];
  const take = Math.min(size, pool.length);
  if (take === pool.length) return shuffle(pool);

  if (profile === "harder") {
    const sorted = [...pool].sort((a, b) => b.difficulty - a.difficulty || a.id.localeCompare(b.id));
    const cut = Math.max(take, Math.ceil(pool.length * 0.45));
    const band = sorted.slice(0, Math.min(cut, sorted.length));
    const source = band.length >= take ? band : sorted;
    return shuffle(source).slice(0, take);
  }

  if (profile === "easier") {
    const sorted = [...pool].sort((a, b) => a.difficulty - b.difficulty || a.id.localeCompare(b.id));
    const cut = Math.max(take, Math.ceil(pool.length * 0.45));
    const band = sorted.slice(0, Math.min(cut, sorted.length));
    const source = band.length >= take ? band : sorted;
    return shuffle(source).slice(0, take);
  }

  const target = targetDifficultyFromMastery(masteryPct);
  const ranked = [...pool].sort((a, b) => byDistanceToTarget(a, b, target));
  const near = ranked.slice(0, Math.max(take * 3, take));
  return shuffle(near).slice(0, take);
}

export function quizPickProfileForRecommendationAction(
  action: string,
): QuizPickProfile {
  if (action === "TRY_HARDER_QUESTIONS") return "harder";
  if (action === "LEARN_CONCEPT" || action === "REVISIT_PREREQUISITE") return "easier";
  return "default";
}
