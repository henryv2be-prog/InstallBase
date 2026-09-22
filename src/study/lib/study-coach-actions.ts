"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { dismissStudyRecommendation } from "@/study/lib/recommendation/service";

export async function dismissNextStepRecommendation(subtopicId: string, recommendationLogId?: string) {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  await dismissStudyRecommendation({
    learnerId: learner.id,
    subtopicId,
    recommendationLogId: recommendationLogId ?? null,
  });

  revalidatePath("/study/dashboard");
  revalidatePath("/study/progress");
  return { ok: true as const };
}

export async function updateDailyStudyMinutes(minutes: number) {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  const clamped = Math.max(15, Math.min(240, Math.round(minutes)));
  await prisma.studyLearner.update({
    where: { id: learner.id },
    data: { defaultAvailableMinutes: clamped },
  });

  const planDate = new Date();
  planDate.setUTCHours(0, 0, 0, 0);
  await prisma.studyPlanDay.deleteMany({
    where: { learnerId: learner.id, planDate },
  });

  revalidatePath("/study/dashboard");
  revalidatePath("/study/profile");
  return { ok: true as const, minutes: clamped };
}
