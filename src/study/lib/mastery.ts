import { StudyPriorityBand } from "@/generated/prisma/client";

export function masteryFromAttempts(questionsCorrect: number, questionsAttempted: number): number {
  if (questionsAttempted <= 0) return 0;
  return Math.round((questionsCorrect / questionsAttempted) * 1000) / 10;
}

/** Blend onboarding confidence with early quiz data until enough attempts exist. */
export function computeMasteryPct(params: {
  questionsAttempted: number;
  questionsCorrect: number;
  confidencePct: number | null;
}): number {
  const performance = masteryFromAttempts(params.questionsCorrect, params.questionsAttempted);
  if (params.questionsAttempted === 0) {
    return params.confidencePct ?? 0;
  }
  if (params.questionsAttempted < 5 && params.confidencePct != null) {
    const weight = params.questionsAttempted / 5;
    return Math.round((performance * weight + params.confidencePct * (1 - weight)) * 10) / 10;
  }
  return performance;
}

export function priorityBandForMastery(masteryPct: number): StudyPriorityBand {
  if (masteryPct < 50) return StudyPriorityBand.NEEDS_ATTENTION;
  if (masteryPct < 70) return StudyPriorityBand.KEEP_PRACTISING;
  return StudyPriorityBand.ON_TRACK;
}

export function priorityScoreForTopic(masteryPct: number, importance = 1): number {
  return Math.round((100 - masteryPct) * importance * 10) / 10;
}
