export type OnboardingExamEntry = {
  examAt: string;
  paperNumber: string;
  durationMinutes: string;
};

/** Typical NSC final exam window (prototype — learner can edit). */
export const DEFAULT_ONBOARDING_EXAM: OnboardingExamEntry = {
  examAt: "2026-11-04",
  paperNumber: "1",
  durationMinutes: "180",
};

/** Smarter defaults by subject slug (Paper 1 focus; dates staggered slightly). */
export function defaultExamForSubjectSlug(slug: string): OnboardingExamEntry {
  if (slug === "life-orientation") {
    return { examAt: "2026-11-02", paperNumber: "1", durationMinutes: "120" };
  }
  if (
    slug === "mathematics" ||
    slug === "mathematical-literacy" ||
    slug === "physical-sciences" ||
    slug === "life-sciences"
  ) {
    return { examAt: "2026-11-04", paperNumber: "1", durationMinutes: "180" };
  }
  if (slug.includes("language") || slug.startsWith("afrikaans") || slug.startsWith("english")) {
    return { examAt: "2026-11-05", paperNumber: "1", durationMinutes: "180" };
  }
  if (
    slug === "accounting" ||
    slug === "business-studies" ||
    slug === "economics" ||
    slug === "geography" ||
    slug === "history"
  ) {
    return { examAt: "2026-11-06", paperNumber: "1", durationMinutes: "180" };
  }
  return { ...DEFAULT_ONBOARDING_EXAM };
}

/** Every catalog subject id gets an exam row; learner overrides merge on top. */
export function buildInitialExamMap(
  subjectIds: string[],
  overrides?: Record<string, OnboardingExamEntry>,
  slugById?: Record<string, string>,
): Record<string, OnboardingExamEntry> {
  const base = Object.fromEntries(
    subjectIds.map((id) => {
      const slug = slugById?.[id];
      const def = slug ? defaultExamForSubjectSlug(slug) : { ...DEFAULT_ONBOARDING_EXAM };
      return [id, { ...def }];
    }),
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
  subjectSlug?: string,
): OnboardingExamEntry {
  return (
    exams[subjectId] ??
    (subjectSlug ? defaultExamForSubjectSlug(subjectSlug) : { ...DEFAULT_ONBOARDING_EXAM })
  );
}
