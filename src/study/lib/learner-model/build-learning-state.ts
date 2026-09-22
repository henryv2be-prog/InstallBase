import "server-only";
import {
  StudyContentSourceKind,
  StudyOfficialVerificationStatus,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { daysUntilExam } from "@/study/lib/days-until-exam";
import type {
  LearnerBehaviourSummary,
  LearnerProfile,
  LearningState,
  TopicMasteryState,
} from "@/study/lib/learner-model/types";
import { getLearnerProgressStats } from "@/study/lib/queries";

function sessionScorePercent(correct: number, total: number): number {
  if (total <= 0) return 0;
  return Math.round((correct / total) * 100);
}

function recentIncorrectStreak(scores: number[]): number {
  let n = 0;
  for (const s of scores) {
    if (s >= 50) break;
    n += 1;
  }
  return n;
}

function computeTrend(scores: number[]): number | null {
  if (scores.length < 4) return null;
  const recent = scores.slice(0, Math.min(5, scores.length));
  const older = scores.slice(recent.length, recent.length + 5);
  if (older.length === 0) return null;
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  return Math.round((recentAvg - olderAvg) * 10) / 10;
}

export async function buildLearningState(learnerId: string): Promise<LearningState | null> {
  const learner = await prisma.studyLearner.findUnique({
    where: { id: learnerId },
    include: {
      subjects: {
        include: {
          subject: true,
          exams: { orderBy: { examAt: "asc" }, take: 1 },
        },
      },
      masteries: {
        include: {
          subtopic: {
            include: {
              topic: { include: { curriculum: { include: { subject: true } } } },
              questions: {
                where: { active: true },
                select: {
                  sourceKind: true,
                  verificationStatus: true,
                  difficulty: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!learner) return null;

  const enrolledSubjectIds = new Set(learner.subjects.map((s) => s.subjectId));

  const [attempts, sessions, progressStats] = await Promise.all([
    prisma.studyQuestionAttempt.findMany({
      where: { learnerId },
      orderBy: { attemptedAt: "desc" },
      take: 500,
      include: {
        question: { select: { subtopicId: true, difficulty: true } },
      },
    }),
    prisma.studyAssessmentSession.findMany({
      where: { learnerId },
      orderBy: { startedAt: "desc" },
      take: 200,
      include: {
        attempts: { select: { isCorrect: true } },
      },
    }),
    getLearnerProgressStats(learnerId),
  ]);

  const attemptsBySubtopic = new Map<string, typeof attempts>();
  for (const a of attempts) {
    const sid = a.question.subtopicId;
    const list = attemptsBySubtopic.get(sid) ?? [];
    list.push(a);
    attemptsBySubtopic.set(sid, list);
  }

  const sessionsBySubtopic = new Map<string, typeof sessions>();
  for (const s of sessions) {
    const list = sessionsBySubtopic.get(s.subtopicId) ?? [];
    list.push(s);
    sessionsBySubtopic.set(s.subtopicId, list);
  }

  const now = new Date();
  const abandonedThresholdMs = 15 * 60 * 1000;
  let totalAbandoned = 0;
  const completedDurations: number[] = [];

  for (const s of sessions) {
    if (s.completedAt) {
      completedDurations.push(
        (s.completedAt.getTime() - s.startedAt.getTime()) / 60000,
      );
    } else if (now.getTime() - s.startedAt.getTime() > abandonedThresholdMs) {
      totalAbandoned += 1;
    }
  }

  const profile: LearnerProfile = {
    learnerId: learner.id,
    displayName: learner.displayName,
    schoolYear: learner.schoolYear,
    defaultAvailableMinutes: learner.defaultAvailableMinutes,
    subjects: learner.subjects.map((ls) => {
      const demonstratedMarkPct = ls.demonstratedMarkPct ?? null;
      const effectiveMarkPct = demonstratedMarkPct ?? ls.currentMarkPct;
      return {
        subjectId: ls.subjectId,
        subjectSlug: ls.subject.slug,
        subjectName: ls.subject.name,
        currentMarkPct: ls.currentMarkPct,
        demonstratedMarkPct,
        effectiveMarkPct,
        targetMarkPct: ls.targetMarkPct,
        examAt: ls.exams[0]?.examAt ?? null,
        examDays: ls.exams[0] ? daysUntilExam(ls.exams[0].examAt) : null,
      };
    }),
  };

  const topics: TopicMasteryState[] = [];

  for (const m of learner.masteries) {
    const sub = m.subtopic;
    const subjectId = sub.topic.curriculum.subjectId;
    if (!enrolledSubjectIds.has(subjectId)) continue;

    const subAttempts = attemptsBySubtopic.get(sub.id) ?? [];
    const recentAttemptScores = subAttempts.slice(0, 10).map((a) => (a.isCorrect ? 100 : 0));

    const subSessions = sessionsBySubtopic.get(sub.id) ?? [];
    const recentSessionScores = subSessions
      .filter((s) => s.completedAt)
      .slice(0, 5)
      .map((s) => {
        const total = s.attempts.length;
        const correct = s.attempts.filter((a) => a.isCorrect).length;
        return sessionScorePercent(correct, total);
      });

    let sessionsCompleted = 0;
    let sessionsAbandoned = 0;
    for (const s of subSessions) {
      if (s.completedAt) sessionsCompleted += 1;
      else if (now.getTime() - s.startedAt.getTime() > abandonedThresholdMs) sessionsAbandoned += 1;
    }

    const correctAttempts = subAttempts.filter((a) => a.isCorrect);
    const avgDiffAttempted =
      subAttempts.length > 0
        ? subAttempts.reduce((sum, a) => sum + a.question.difficulty, 0) / subAttempts.length
        : null;
    const avgDiffCorrect =
      correctAttempts.length > 0
        ? correctAttempts.reduce((sum, a) => sum + a.question.difficulty, 0) / correctAttempts.length
        : null;

    const officialQuestionCount = sub.questions.filter(
      (q) =>
        q.sourceKind === StudyContentSourceKind.OFFICIAL_PAST_PAPER &&
        q.verificationStatus === StudyOfficialVerificationStatus.VERIFIED,
    ).length;

    topics.push({
      subtopicId: sub.id,
      subtopicSlug: sub.slug,
      subtopicName: sub.name,
      topicId: sub.topicId,
      topicSlug: sub.topic.slug,
      topicName: sub.topic.name,
      topicImportance: sub.topic.importance,
      subjectId: sub.topic.curriculum.subjectId,
      subjectSlug: sub.topic.curriculum.subject.slug,
      subjectName: sub.topic.curriculum.subject.name,
      prerequisiteSubtopicId: sub.prerequisiteSubtopicId,
      masteryPct: m.masteryPct,
      questionsAttempted: m.questionsAttempted,
      questionsCorrect: m.questionsCorrect,
      confidencePct: m.confidencePct,
      selfConfidence: m.selfConfidence,
      lastPracticedAt: m.lastPracticedAt,
      recentAttemptScores,
      recentIncorrectStreak: recentIncorrectStreak(recentAttemptScores),
      recentSessionScores,
      improvementTrend: computeTrend(recentAttemptScores),
      avgDifficultyCorrect: avgDiffCorrect,
      avgDifficultyAttempted: avgDiffAttempted,
      questionCount: sub.questions.length,
      officialQuestionCount,
      sessionsCompleted,
      sessionsAbandoned,
    });
  }

  const weekAgo = new Date(now.getTime() - 7 * 86400000);
  const sessionCounts = new Map<string, number>();
  for (const s of sessions) {
    if (s.startedAt >= weekAgo) {
      sessionCounts.set(s.subtopicId, (sessionCounts.get(s.subtopicId) ?? 0) + 1);
    }
  }

  const subtopicsRepeated = [...sessionCounts.entries()]
    .filter(([, c]) => c >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  const subtopicsAvoided = topics
    .filter((t) => {
      const days = t.lastPracticedAt
        ? (now.getTime() - t.lastPracticedAt.getTime()) / 86400000
        : 999;
      return t.masteryPct < 60 && days > 10 && t.questionCount > 0;
    })
    .slice(0, 5)
    .map((t) => t.subtopicId);

  const behaviour: LearnerBehaviourSummary = {
    totalSessionsCompleted: progressStats.completedSessions,
    totalSessionsAbandoned: totalAbandoned,
    typicalSessionMinutes:
      completedDurations.length > 0
        ? Math.round(
            completedDurations.reduce((a, b) => a + b, 0) / completedDurations.length,
          )
        : null,
    currentStreakDays: progressStats.streakDays,
    subtopicsAvoided,
    subtopicsRepeated,
  };

  return {
    profile,
    topics,
    behaviour,
    generatedAt: now,
  };
}
