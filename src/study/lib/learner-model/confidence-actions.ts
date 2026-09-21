"use server";

import { StudySelfConfidence } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";

export async function setSubtopicSelfConfidence(
  subtopicId: string,
  confidence: StudySelfConfidence,
) {
  const learner = await getStudyLearnerForRequest();
  if (!isLearnerOnboarded(learner)) {
    return { ok: false as const, error: "Complete onboarding first." };
  }

  await prisma.studyMastery.upsert({
    where: { learnerId_subtopicId: { learnerId: learner.id, subtopicId } },
    create: {
      learnerId: learner.id,
      subtopicId,
      selfConfidence: confidence,
      masteryPct: 0,
    },
    update: { selfConfidence: confidence },
  });

  revalidatePath("/study/dashboard");
  revalidatePath("/study/subjects");
  return { ok: true as const };
}
