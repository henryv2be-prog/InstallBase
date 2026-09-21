import "server-only";
import { prisma } from "@/lib/prisma";
import { GRADE_12_NSC_SUBJECT_CATALOG } from "@/study/data/grade-12-subject-catalog";
import { seedStudyCurriculum } from "@/study/lib/seed-curriculum";

/** Lazy seed when deploy seed did not run yet — safe to call on onboarding load. */
export async function ensureStudyCatalog() {
  const count = await prisma.studySubject.count({ where: { grade: 12, active: true } });
  if (count >= GRADE_12_NSC_SUBJECT_CATALOG.length) return;
  await seedStudyCurriculum();
}
