import type { PostIntent, PostType } from "@/generated/prisma/client";
import { COMPOSER_POST_INTENTS } from "@/lib/work-posts";

export type HighlightPost = {
  id: string;
  title: string | null;
  content: string;
  type: PostType;
  postIntent: PostIntent;
};

export type CommunityActivity = {
  since: Date;
  posts: number;
  installations: number;
  questions: number;
  answers: number;
  bragPoints: number;
  highlight: HighlightPost | null;
};

export function totalActivityCount(activity: CommunityActivity): number {
  const postActivity = Math.max(activity.posts, activity.installations);
  return postActivity + activity.questions + activity.answers + activity.bragPoints;
}

export function hasMeaningfulActivity(activity: CommunityActivity, minCount = 1): boolean {
  return totalActivityCount(activity) >= minCount;
}

const INTENT_LABELS = new Map(COMPOSER_POST_INTENTS.map((item) => [item.value, item.label]));

export function describePostForHighlight(post: HighlightPost): string {
  if (post.type === "QUESTION") {
    const snippet = (post.title || post.content).trim();
    return snippet.length > 60 ? `${snippet.slice(0, 57)}…` : snippet;
  }

  const intentLabel = INTENT_LABELS.get(post.postIntent);
  if (post.postIntent === "PROJECT_INSTALLATION" || post.type === "PROJECT") {
    const trade = extractTrade(post.content);
    if (trade) return `a new ${trade} installation`;
    return "a new installation";
  }
  if (post.postIntent === "SERVICE_REPAIR") return "a new service / repair job";
  if (intentLabel && post.postIntent !== "GENERAL") {
    return `a new ${intentLabel.toLowerCase()} post`;
  }

  const snippet = (post.title || post.content).trim();
  return snippet.length > 50 ? `${snippet.slice(0, 47)}…` : snippet;
}

function extractTrade(content: string): string | null {
  const lower = content.toLowerCase();
  const trades = ["access control", "cctv", "fire alarm", "intruder", "networking", "av", "solar"];
  for (const trade of trades) {
    if (lower.includes(trade)) return trade;
  }
  return null;
}
