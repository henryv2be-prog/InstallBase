import "server-only";
import { prisma } from "@/lib/prisma";
import { GRADE_12_NSC_SUBJECT_CATALOG } from "@/study/data/grade-12-subject-catalog";
import { ensurePracticeQuestions } from "@/study/lib/seed-questions";
import { seedStudyCurriculum } from "@/study/lib/seed-curriculum";

/** Safety net when Railway start seed has not run yet or failed — idempotent. */
export async function ensureStudyCatalog() {
  const count = await prisma.studySubject.count({ where: { grade: 12, active: true } });
  if (count < GRADE_12_NSC_SUBJECT_CATALOG.length) {
    await seedStudyCurriculum();
  }
  await ensurePracticeQuestions();
}
