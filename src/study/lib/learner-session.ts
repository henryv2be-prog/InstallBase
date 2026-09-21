import "server-only";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STUDY_LEARNER_COOKIE } from "@/study/lib/constants";

const learnerInclude = {
  subjects: {
    include: {
      subject: true,
      exams: { orderBy: { examAt: "asc" as const } },
    },
    orderBy: { subject: { sortOrder: "asc" as const } },
  },
} as const;

export type StudyLearnerProfile = NonNullable<Awaited<ReturnType<typeof getStudyLearnerForRequest>>>;

export async function getStudyLearnerForRequest() {
  const session = await getSession();
  const cookieStore = await cookies();
  const cookieId = cookieStore.get(STUDY_LEARNER_COOKIE)?.value;
  const userId = session?.user?.id;

  if (userId) {
    const byUser = await prisma.studyLearner.findUnique({
      where: { userId },
      include: learnerInclude,
    });
    if (byUser) return byUser;

    if (cookieId) {
      const byCookie = await prisma.studyLearner.findUnique({
        where: { id: cookieId },
        include: learnerInclude,
      });
      if (byCookie && !byCookie.userId) {
        try {
          return await prisma.studyLearner.update({
            where: { id: cookieId },
            data: { userId },
            include: learnerInclude,
          });
        } catch {
          // Another learner may already be linked to this user — fall through to cookie read.
        }
      }
    }
  }

  if (cookieId) {
    return prisma.studyLearner.findUnique({
      where: { id: cookieId },
      include: learnerInclude,
    });
  }

  return null;
}

export function isLearnerOnboarded(learner: StudyLearnerProfile | null): boolean {
  return Boolean(learner?.onboardedAt && learner.subjects.length > 0);
}
