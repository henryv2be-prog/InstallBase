/** Normalise learner answers for official NSC short-answer marking. */
export function normalizeStudyAnswer(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[₹$r]/g, "")
    .replace(/\s+/g, "")
    .replace(/×10\^?/g, "e")
    .replace(/−/g, "-")
    .replace(/,/g, ";");
}

export function answersMatch(learnerRaw: string, patterns: string[]): boolean {
  const learner = normalizeStudyAnswer(learnerRaw);
  if (!learner) return false;

  for (const pattern of patterns) {
    const target = normalizeStudyAnswer(pattern);
    if (!target) continue;
    if (learner === target) return true;

    const learnerNums = extractNumbers(learner);
    const targetNums = extractNumbers(target);
    if (learnerNums.length > 0 && learnerNums.length === targetNums.length) {
      const allClose = learnerNums.every((n, i) => Math.abs(n - targetNums[i]!) < 0.05);
      if (allClose) return true;
    }
  }
  return false;
}

function extractNumbers(s: string): number[] {
  const parts = s.split(/[^0-9.e-]+/).filter(Boolean);
  const nums: number[] = [];
  for (const p of parts) {
    const n = Number(p.replace(/^e/, "1e"));
    if (!Number.isNaN(n)) nums.push(n);
  }
  return nums;
}

export function buildShortAnswerPatterns(
  correctAnswerText: string,
  acceptableAnswers: string[] | undefined,
): string[] {
  return [correctAnswerText, ...(acceptableAnswers ?? [])];
}
