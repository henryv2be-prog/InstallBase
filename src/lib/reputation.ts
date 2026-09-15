import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { ReputationLevel } from "@/generated/prisma/client";

export const REPUTATION_POINTS = {
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

type DbClient = Prisma.TransactionClient | typeof prisma;

/** Reconcile PostMedia.bragScore with MediaBragPoint rows. */
export async function syncMediaBragScore(postMediaId: string, db: DbClient = prisma) {
  const count = await db.mediaBragPoint.count({ where: { postMediaId } });
  return db.postMedia.update({
    where: { id: postMediaId },
    data: { bragScore: count },
    select: { bragScore: true, postId: true },
  });
}

/** Reconcile post.bragScore as the sum of its media brag scores. */
export async function syncPostBragScore(postId: string, db: DbClient = prisma) {
  const media = await db.postMedia.findMany({
    where: { postId },
    select: { bragScore: true },
  });
  const total = media.reduce((sum, item) => sum + item.bragScore, 0);
  return db.post.update({
    where: { id: postId },
    data: { bragScore: total },
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

/** Repair all media and post bragScore fields from MediaBragPoint counts. */
export async function reconcileAllBragScores() {
  const media = await prisma.postMedia.findMany({
    where: { bragPoints: { some: {} } },
    select: { id: true, postId: true, _count: { select: { bragPoints: true } } },
  });

  const postTotals = new Map<string, number>();

  for (const item of media) {
    await prisma.postMedia.update({
      where: { id: item.id },
      data: { bragScore: item._count.bragPoints },
    });
    postTotals.set(item.postId, (postTotals.get(item.postId) ?? 0) + item._count.bragPoints);
  }

  for (const [postId, total] of postTotals) {
    await prisma.post.update({
      where: { id: postId },
      data: { bragScore: total },
    });
  }
}
