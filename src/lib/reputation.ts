import { prisma } from "@/lib/prisma";
import type { ReputationLevel } from "@/generated/prisma/client";

export const REPUTATION_POINTS = {
  LIKE_RECEIVED: 2,
  BRAG_RECEIVED: 5,
  SOLUTION: 25,
} as const;

export function calculateReputationLevel(score: number): ReputationLevel {
  if (score >= 5000) return "MASTER";
  if (score >= 3000) return "EXPERT";
  if (score >= 1500) return "PRO";
  if (score >= 500) return "EXPERIENCED";
  if (score >= 100) return "INSTALLER";
  return "APPRENTICE";
}

type ReputationDelta = {
  score: number;
  likesReceived?: number;
  bragEngagement?: number;
  helpfulAnswers?: number;
  solvedQuestions?: number;
};

/** Keep Profile and Reputation tables in sync — UI reads from Profile. */
export async function applyReputationDelta(userId: string, delta: ReputationDelta) {
  const updated = await prisma.reputation.update({
    where: { userId },
    data: {
      score: { increment: delta.score },
      ...(delta.likesReceived !== undefined && { likesReceived: { increment: delta.likesReceived } }),
      ...(delta.bragEngagement !== undefined && { bragEngagement: { increment: delta.bragEngagement } }),
      ...(delta.helpfulAnswers !== undefined && { helpfulAnswers: { increment: delta.helpfulAnswers } }),
      ...(delta.solvedQuestions !== undefined && { solvedQuestions: { increment: delta.solvedQuestions } }),
    },
  });

  const level = calculateReputationLevel(updated.score);
  await prisma.profile.update({
    where: { userId },
    data: {
      reputationScore: updated.score,
      reputationLevel: level,
      ...(delta.helpfulAnswers !== undefined && { helpfulAnswers: { increment: delta.helpfulAnswers } }),
    },
  });

  return updated;
}

/** Reconcile post.bragScore with actual BragPoint rows. */
export async function syncPostBragScore(postId: string) {
  const count = await prisma.bragPoint.count({ where: { postId } });
  return prisma.post.update({
    where: { id: postId },
    data: { bragScore: count },
    select: { bragScore: true, authorId: true },
  });
}

/** Repair drift between Reputation.score and Profile.reputationScore for all users. */
export async function reconcileAllReputationScores() {
  const reputations = await prisma.reputation.findMany({ select: { userId: true, score: true } });
  for (const rep of reputations) {
    await prisma.profile.update({
      where: { userId: rep.userId },
      data: {
        reputationScore: rep.score,
        reputationLevel: calculateReputationLevel(rep.score),
      },
    });
  }
}

/** Repair all post bragScore fields from BragPoint counts. */
export async function reconcileAllBragScores() {
  const posts = await prisma.post.findMany({
    where: { bragPoints: { some: {} } },
    select: { id: true, _count: { select: { bragPoints: true } } },
  });

  for (const post of posts) {
    await prisma.post.update({
      where: { id: post.id },
      data: { bragScore: post._count.bragPoints },
    });
  }
}
