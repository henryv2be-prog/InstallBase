import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow } from "date-fns";

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
