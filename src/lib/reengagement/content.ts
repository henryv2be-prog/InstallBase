import type { CommunityActivity } from "./activity-shared";
import { describePostForHighlight, totalActivityCount } from "./activity-shared";

export type ReengagementContent = {
  title: string;
  body: string;
  message: string;
  url: string;
};

const TITLE_VARIATIONS = [
  "🔧 InstallBase today",
  "🔥 What's happening on InstallBase",
  "💬 What's happening on InstallBase?",
  "📸 New work is being shared",
];

const GENERIC_BODIES = [
  "See what's happening in the installer community.",
  "New installs, questions and advice from installers.",
  "See the latest work and questions from the community.",
  "New installs, questions and Brag points from the community.",
];

function pickVariation<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

function formatCount(count: number, singular: string, plural: string): string | null {
  if (count <= 0) return null;
  return count === 1 ? `1 ${singular}` : `${count} ${plural}`;
}

function buildStatsLine(activity: CommunityActivity): string | null {
  const otherPosts = Math.max(0, activity.posts - activity.installations);
  const parts = [
    formatCount(activity.installations, "new install", "new installs"),
    formatCount(otherPosts, "new post", "new posts"),
    formatCount(activity.questions, "question", "questions"),
    formatCount(activity.answers, "answer", "answers"),
    formatCount(activity.bragPoints, "Brag point", "Brag points"),
  ].filter(Boolean);

  if (parts.length === 0) return null;
  if (parts.length === 1) return `${parts[0]} have been posted.`;
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}.`;
  return `${parts.slice(0, -1).join(", ")} and ${parts[parts.length - 1]}.`;
}

function buildHighlightContent(activity: CommunityActivity): ReengagementContent | null {
  if (!activity.highlight) return null;

  const description = describePostForHighlight(activity.highlight);
  const url = `/post/${activity.highlight.id}?ref=daily-reengagement`;
  const title = activity.highlight.type === "QUESTION" ? "💬 New on InstallBase" : "🔧 New on InstallBase";
  const body = `${capitalize(description)}. See it →`;

  return {
    title,
    body,
    message: body,
    url,
  };
}

function capitalize(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function buildReengagementContent(
  activity: CommunityActivity,
  seed = new Date().getUTCDate()
): ReengagementContent | null {
  if (totalActivityCount(activity) === 0) return null;

  const highlight = buildHighlightContent(activity);
  if (highlight) return highlight;

  const statsLine = buildStatsLine(activity);
  const title = pickVariation(TITLE_VARIATIONS, seed);
  const url = "/feed?ref=daily-reengagement";

  if (statsLine) {
    const closers = ["See what's happening →", "Open InstallBase →", "See what's new →"];
    const body = `${statsLine} ${pickVariation(closers, seed + 1)}`;
    return { title, body, message: body, url };
  }

  const body = `${pickVariation(GENERIC_BODIES, seed)} Open InstallBase →`;
  return { title, body, message: body, url };
}
