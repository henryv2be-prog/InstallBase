import "server-only";
import { prisma } from "@/lib/prisma";
import type { RecommendationFeedback } from "@/study/lib/recommendation/feedback-types";

export type { RecommendationFeedback } from "@/study/lib/recommendation/feedback-types";

const DISMISS_WINDOW_DAYS = 14;
const STALE_SHOWN_MIN = 2;
const STALE_WINDOW_DAYS = 7;

export async function loadRecommendationFeedback(learnerId: string): Promise<RecommendationFeedback> {
  const now = Date.now();
  const dismissSince = new Date(now - DISMISS_WINDOW_DAYS * 86400000);
  const staleSince = new Date(now - STALE_WINDOW_DAYS * 86400000);

  const [dismissed, recentShown] = await Promise.all([
    prisma.studyRecommendationLog.findMany({
      where: { learnerId, dismissedAt: { gte: dismissSince } },
      select: { subtopicId: true },
    }),
    prisma.studyRecommendationLog.findMany({
      where: { learnerId, shownAt: { gte: staleSince } },
      select: { subtopicId: true, followedAt: true },
    }),
  ]);

  const dismissedSubtopicIds = new Set(dismissed.map((r) => r.subtopicId));

  const showCounts = new Map<string, { shows: number; followed: number }>();
  for (const row of recentShown) {
    const cur = showCounts.get(row.subtopicId) ?? { shows: 0, followed: 0 };
    cur.shows += 1;
    if (row.followedAt) cur.followed += 1;
    showCounts.set(row.subtopicId, cur);
  }

  const staleSuggestionSubtopicIds = new Set<string>();
  for (const [subtopicId, stats] of showCounts) {
    if (stats.shows >= STALE_SHOWN_MIN && stats.followed === 0) {
      staleSuggestionSubtopicIds.add(subtopicId);
    }
  }

  return { dismissedSubtopicIds, staleSuggestionSubtopicIds };
}
