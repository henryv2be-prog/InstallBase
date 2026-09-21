import type { RecommendationCopy, StudyLocale } from "@/study/i18n/types";
import { localizeSubjectName } from "@/study/i18n/localize-content";
import type { LearningState } from "@/study/lib/learner-model/types";
import { examUrgencyMultiplier } from "@/study/lib/recommendation/score-candidates";

export type WeeklyStudyFocus = {
  subjectId: string;
  subjectSlug: string;
  subjectName: string;
  currentMarkPct: number;
  targetMarkPct: number;
  markGap: number;
  examDays: number | null;
  headline: string;
  detail: string;
};

/** Simple weekly prioritisation — highest return on study time at subject level. */
export function getWeeklyStudyFocus(
  state: LearningState,
  copy: RecommendationCopy,
  locale: StudyLocale = "en",
): WeeklyStudyFocus | null {
  const topicsBySubject = new Map<string, typeof state.topics>();
  for (const t of state.topics) {
    const list = topicsBySubject.get(t.subjectId) ?? [];
    list.push(t);
    topicsBySubject.set(t.subjectId, list);
  }

  let best: WeeklyStudyFocus | null = null;
  let bestScore = -1;

  for (const subject of state.profile.subjects) {
    const markGap = Math.max(0, subject.targetMarkPct - subject.currentMarkPct);
    if (markGap <= 0) continue;

    const topics = topicsBySubject.get(subject.subjectId) ?? [];
    const withQuestions = topics.filter((t) => t.questionCount > 0);
    const neverPractised = withQuestions.filter((t) => t.questionsAttempted === 0).length;
    const belowTarget = withQuestions.filter(
      (t) => t.masteryPct < subject.targetMarkPct - 5,
    ).length;
    const practicePressure =
      withQuestions.length > 0
        ? (neverPractised * 1.2 + belowTarget) / withQuestions.length
        : 0.5;

    const urgency = examUrgencyMultiplier(subject.examDays);
    const score = markGap * urgency * (1 + practicePressure * 0.35);

    if (score <= bestScore) continue;

    const subjectName = localizeSubjectName(locale, subject.subjectSlug, subject.subjectName);
    bestScore = score;
    best = {
      subjectId: subject.subjectId,
      subjectSlug: subject.subjectSlug,
      subjectName,
      currentMarkPct: subject.currentMarkPct,
      targetMarkPct: subject.targetMarkPct,
      markGap,
      examDays: subject.examDays,
      headline: copy.weeklyFocusHeadline(subjectName, markGap, subject.targetMarkPct),
      detail: copy.weeklyFocusDetail(
        subjectName,
        markGap,
        subject.examDays,
        neverPractised,
        belowTarget,
      ),
    };
  }

  return best;
}
