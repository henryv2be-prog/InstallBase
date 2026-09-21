import "server-only";
import { prisma } from "@/lib/prisma";
import { seedStudyCurriculum } from "@/study/lib/seed-curriculum";

/** Lazy seed when deploy seed did not run yet — safe to call on onboarding load. */
export async function ensureStudyCatalog() {
  const count = await prisma.studySubject.count({ where: { grade: 12, active: true } });
  if (count >= 4) return;
  await seedStudyCurriculum();
}
