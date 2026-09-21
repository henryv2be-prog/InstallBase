export type OnboardingExamEntry = {
  examAt: string;
  paperNumber: string;
  durationMinutes: string;
};

export const DEFAULT_ONBOARDING_EXAM: OnboardingExamEntry = {
  examAt: "2026-11-04",
  paperNumber: "1",
  durationMinutes: "180",
};

/** Every catalog subject id gets an exam row; learner overrides merge on top. */
export function buildInitialExamMap(
  subjectIds: string[],
  overrides?: Record<string, OnboardingExamEntry>,
): Record<string, OnboardingExamEntry> {
  const base = Object.fromEntries(
    subjectIds.map((id) => [id, { ...DEFAULT_ONBOARDING_EXAM }]),
  ) as Record<string, OnboardingExamEntry>;
  if (!overrides) return base;
  for (const [id, row] of Object.entries(overrides)) {
    if (base[id]) {
      base[id] = { ...base[id], ...row };
    }
  }
  return base;
}

export function examEntryForSubject(
  exams: Record<string, OnboardingExamEntry | undefined>,
  subjectId: string,
): OnboardingExamEntry {
  return exams[subjectId] ?? { ...DEFAULT_ONBOARDING_EXAM };
}
