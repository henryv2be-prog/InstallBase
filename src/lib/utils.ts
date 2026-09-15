import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

export function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRelativeTime(date: Date | string) {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getReputationLabel(level: string) {
  const labels: Record<string, string> = {
    APPRENTICE: "Apprentice",
    INSTALLER: "Installer",
    EXPERIENCED: "Experienced Installer",
    PRO: "Pro Installer",
    EXPERT: "Expert Installer",
    MASTER: "Master Installer",
  };
  return labels[level] ?? level;
}

export function getExperienceLabel(level: string) {
  const labels: Record<string, string> = {
    APPRENTICE: "Apprentice",
    ONE_TO_THREE: "1–3 years",
    THREE_TO_FIVE: "3–5 years",
    FIVE_TO_TEN: "5–10 years",
    TEN_PLUS: "10+ years",
  };
  return labels[level] ?? level;
}

export function getFeedReasonLabel(
  post: {
    authorId: string;
    bragScore: number;
    author: { profile: { specialties: string[] } | null };
    tags: { tag: { name: string } }[];
  },
  context: "following" | "popular",
  followingIds?: Set<string>
) {
  if (context === "following") return "From someone you follow";
  if (followingIds?.has(post.authorId)) return "From someone you follow";
  const specialty = post.author.profile?.specialties?.[0];
  if (specialty) return `Popular in ${specialty}`;
  const tag = post.tags[0]?.tag.name;
  if (tag) return `Trending in #${tag}`;
  if (post.bragScore >= 5) return "Trending install";
  return null;
}
