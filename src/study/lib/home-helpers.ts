import { QUIZ_SIZE } from "@/study/lib/quiz-types";

export function studyGreeting(firstName: string, hour = new Date().getHours()): string {
  const name = firstName.trim() || "there";
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

export function studyEncouragementLine(): string {
  const lines = [
    "You've got this.",
    "One session at a time.",
    "Small steps add up.",
    "Let's make today count.",
  ];
  const dayIndex = new Date().getDate() % lines.length;
  return lines[dayIndex]!;
}

/** Rough session length for UI copy (not a scheduling engine). */
export function estimateSessionMinutes(questionCount = QUIZ_SIZE): number {
  return Math.max(15, Math.round(questionCount * 3.5));
}

export function examCountdownMessage(days: number, onTrack: boolean): string {
  if (days < 0) return "Exam date passed — update your profile if needed.";
  if (days === 0) return "Exam is today. Breathe — you've prepared.";
  if (days <= 7) return onTrack ? "Final stretch — you're on track." : "Final stretch — a little extra focus helps.";
  if (days <= 21) return onTrack ? "You're on track." : "A little more focus needed.";
  return onTrack ? "Plenty of time — stay consistent." : "Let's build momentum.";
}

export function subjectOnTrack(current: number, target: number, avgMastery: number | null): boolean {
  const masteryOk = avgMastery == null || avgMastery >= target - 8;
  return current >= target - 5 || masteryOk;
}
