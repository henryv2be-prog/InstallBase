import "server-only";
import { StudyContentSourceKind, StudyOfficialVerificationStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

export type StudySubjectWithCurriculum = Awaited<ReturnType<typeof getStudySubjectsWithTopics>>[number];

export async function getStudySubjectsForOnboarding() {
  return prisma.studySubject.findMany({
    where: { active: true, grade: 12 },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      slug: true,
      name: true,
      sortOrder: true,
      curricula: {
        take: 1,
        select: { isComplete: true, versionLabel: true },
      },
    },
  });
}

export async function getPracticeLibraryForLearner(learnerId: string) {
  const learner = await prisma.studyLearner.findUnique({
    where: { id: learnerId },
    include: {
      subjects: { include: { subject: true } },
      masteries: true,
    },
  });
  if (!learner) return [];

  const subjectIds = learner.subjects.map((s) => s.subjectId);
  const masteryBySubtopic = new Map(learner.masteries.map((m) => [m.subtopicId, m]));

  const subjects = await prisma.studySubject.findMany({
    where: { id: { in: subjectIds } },
    orderBy: { sortOrder: "asc" },
    include: {
      curricula: {
        take: 1,
        include: {
          topics: {
            orderBy: { sortOrder: "asc" },
            include: {
              subtopics: {
                orderBy: { sortOrder: "asc" },
                include: {
                  questions: {
                    where: { active: true },
                    select: { sourceKind: true, verificationStatus: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });

  return subjects.map((subject) => ({
    id: subject.id,
    slug: subject.slug,
    name: subject.name,
    topics: (subject.curricula[0]?.topics ?? []).map((topic) => ({
      id: topic.id,
      name: topic.name,
      subtopics: topic.subtopics.map((sub) => {
        const mastery = masteryBySubtopic.get(sub.id);
        const officialCount = sub.questions.filter(
          (q) =>
            q.sourceKind === StudyContentSourceKind.OFFICIAL_PAST_PAPER &&
            q.verificationStatus === StudyOfficialVerificationStatus.VERIFIED,
        ).length;
        const practiceCount = sub.questions.filter(
          (q) => q.sourceKind === StudyContentSourceKind.PRACTICE,
        ).length;
        return {
          id: sub.id,
          name: sub.name,
          questionCount: sub.questions.length,
          officialCount,
          practiceCount,
          masteryPct: mastery?.masteryPct ?? null,
          questionsAttempted: mastery?.questionsAttempted ?? 0,
        };
      }),
    })),
  }));
}

export async function getWeakestMasteries(learnerId: string, limit = 5) {
  return prisma.studyMastery.findMany({
    where: { learnerId },
    orderBy: [{ masteryPct: "asc" }, { questionsAttempted: "asc" }],
    take: limit,
    include: {
      subtopic: {
        include: {
          topic: {
            include: {
              curriculum: { include: { subject: true } },
            },
          },
        },
      },
    },
  });
}

export async function getStudySubjectsWithTopics() {
  return prisma.studySubject.findMany({
    where: { active: true, grade: 12 },
    orderBy: { sortOrder: "asc" },
    include: {
      curricula: {
        orderBy: { createdAt: "asc" },
        take: 1,
        include: {
          topics: {
            orderBy: { sortOrder: "asc" },
            include: {
              subtopics: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });
}

export async function getStudyFoundationStats() {
  const [subjects, topics, subtopics] = await Promise.all([
    prisma.studySubject.count({ where: { grade: 12, active: true } }),
    prisma.studyTopic.count(),
    prisma.studySubtopic.count(),
  ]);
  return { subjects, topics, subtopics };
}

export async function getLearnerProgressStats(learnerId: string) {
  const sessions = await prisma.studyAssessmentSession.findMany({
    where: { learnerId, completedAt: { not: null } },
    select: { completedAt: true },
    orderBy: { completedAt: "desc" },
  });

  const completedSessions = sessions.length;

  let streakDays = 0;
  if (sessions.length > 0) {
    const dayKeys = new Set(
      sessions
        .filter((s) => s.completedAt)
        .map((s) => s.completedAt!.toISOString().slice(0, 10)),
    );
    const cursor = new Date();
    cursor.setHours(0, 0, 0, 0);
    while (true) {
      const key = cursor.toISOString().slice(0, 10);
      if (dayKeys.has(key)) {
        streakDays += 1;
        cursor.setDate(cursor.getDate() - 1);
      } else if (streakDays === 0) {
        cursor.setDate(cursor.getDate() - 1);
        const yesterday = cursor.toISOString().slice(0, 10);
        if (dayKeys.has(yesterday)) {
          streakDays = 1;
          cursor.setDate(cursor.getDate() - 1);
          continue;
        }
        break;
      } else {
        break;
      }
    }
  }

  return { completedSessions, streakDays };
}

export async function getSubjectMasteryForLearner(learnerId: string) {
  const learner = await prisma.studyLearner.findUnique({
    where: { id: learnerId },
    include: {
      subjects: { include: { subject: true, exams: { orderBy: { examAt: "asc" }, take: 1 } } },
      masteries: true,
    },
  });
  if (!learner) return [];

  const masteryBySubtopic = new Map(learner.masteries.map((m) => [m.subtopicId, m]));
  const subjectIds = learner.subjects.map((s) => s.subjectId);

  const subjects = await prisma.studySubject.findMany({
    where: { id: { in: subjectIds } },
    orderBy: { sortOrder: "asc" },
    include: {
      curricula: {
        take: 1,
        include: {
          topics: {
            orderBy: { sortOrder: "asc" },
            include: {
              subtopics: { orderBy: { sortOrder: "asc" } },
            },
          },
        },
      },
    },
  });

  const profileBySubjectId = new Map(learner.subjects.map((s) => [s.subjectId, s]));

  return subjects.map((subject) => {
    const profile = profileBySubjectId.get(subject.id)!;
    const topics = subject.curricula[0]?.topics ?? [];

    const topicRows = topics.map((topic) => {
      const subRows = topic.subtopics.map((sub) => {
        const m = masteryBySubtopic.get(sub.id);
        return {
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          masteryPct: m?.masteryPct ?? profile.currentMarkPct,
          questionsAttempted: m?.questionsAttempted ?? 0,
        };
      });
      const withAttempts = subRows.filter((s) => s.questionsAttempted > 0);
      const avgMasteryPct =
        withAttempts.length > 0
          ? withAttempts.reduce((sum, s) => sum + s.masteryPct, 0) / withAttempts.length
          : null;
      return {
        id: topic.id,
        name: topic.name,
        slug: topic.slug,
        avgMasteryPct,
        subtopics: subRows,
      };
    });

    const measured = topicRows
      .flatMap((t) => t.subtopics)
      .filter((s) => s.questionsAttempted > 0);
    const avgMasteryPct =
      measured.length > 0
        ? measured.reduce((sum, s) => sum + s.masteryPct, 0) / measured.length
        : null;

    return {
      subjectId: subject.id,
      subjectSlug: subject.slug,
      subjectName: subject.name,
      currentMarkPct: profile.currentMarkPct,
      targetMarkPct: profile.targetMarkPct,
      nextExamAt: profile.exams[0]?.examAt ?? null,
      avgMasteryPct,
      topics: topicRows,
    };
  });
}
