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

  if (session?.user?.id) {
    const byUser = await prisma.studyLearner.findUnique({
      where: { userId: session.user.id },
      include: learnerInclude,
    });
    if (byUser) return byUser;
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
