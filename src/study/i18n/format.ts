import type { StudyMessages } from "@/study/i18n/types";

export function studyGreetingFromMessages(t: StudyMessages, firstName: string, hour = new Date().getHours()) {
  const name = firstName.trim() || (t.locale === "af" ? "daar" : "there");
  if (hour < 12) return t.homeHelpers.greetingMorning(name);
  if (hour < 17) return t.homeHelpers.greetingAfternoon(name);
  return t.homeHelpers.greetingEvening(name);
}

export function studyEncouragementFromMessages(t: StudyMessages) {
  const lines = t.homeHelpers.encouragement;
  const dayIndex = new Date().getDate() % lines.length;
  return lines[dayIndex]!;
}

export function examCountdownFromMessages(t: StudyMessages, days: number, onTrack: boolean) {
  if (days < 0) return t.homeHelpers.examPassed;
  if (days === 0) return t.homeHelpers.examToday;
  if (days <= 7) return onTrack ? t.homeHelpers.finalOnTrack : t.homeHelpers.finalFocus;
  if (days <= 21) return onTrack ? t.homeHelpers.onTrack : t.homeHelpers.needFocus;
  return onTrack ? t.homeHelpers.plentyOnTrack : t.homeHelpers.plentyMomentum;
}

export function masteryBandLabelFromMessages(t: StudyMessages, pct: number) {
  if (pct >= 75) return t.masteryBand.strong;
  if (pct >= 50) return t.masteryBand.building;
  return t.masteryBand.focus;
}
