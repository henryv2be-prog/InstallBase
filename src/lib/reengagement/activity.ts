import "server-only";
import { prisma } from "@/lib/prisma";
import type { CommunityActivity, HighlightPost } from "./activity-shared";

export type { CommunityActivity, HighlightPost } from "./activity-shared";
export { totalActivityCount, hasMeaningfulActivity, describePostForHighlight } from "./activity-shared";

export async function getCommunityActivity(since: Date): Promise<CommunityActivity> {
  const [posts, installations, questions, answers, bragPoints, highlightCandidate] = await Promise.all([
    prisma.post.count({
      where: {
        createdAt: { gte: since },
        type: { not: "QUESTION" },
      },
    }),
    prisma.post.count({
      where: {
        createdAt: { gte: since },
        OR: [{ postIntent: "PROJECT_INSTALLATION" }, { type: "PROJECT" }],
      },
    }),
    prisma.post.count({
      where: { createdAt: { gte: since }, type: "QUESTION" },
    }),
    prisma.answer.count({
      where: { createdAt: { gte: since } },
    }),
    prisma.mediaBragPoint.count({
      where: { createdAt: { gte: since } },
    }),
    prisma.post.findFirst({
      where: {
        createdAt: { gte: since },
        OR: [
          { postIntent: "PROJECT_INSTALLATION" },
          { type: "PROJECT" },
          { type: "QUESTION" },
        ],
      },
      orderBy: [{ bragScore: "desc" }, { createdAt: "desc" }],
      select: {
        id: true,
        title: true,
        content: true,
        type: true,
        postIntent: true,
      },
    }),
  ]);

  let highlight: HighlightPost | null = null;
  if (highlightCandidate && installations + questions <= 2) {
    highlight = highlightCandidate;
  } else if (highlightCandidate && installations === 1) {
    highlight = highlightCandidate;
  }

  return {
    since,
    posts,
    installations,
    questions,
    answers,
    bragPoints,
    highlight,
  };
}
