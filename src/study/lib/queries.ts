import "server-only";
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
                  _count: { select: { questions: { where: { active: true } } } },
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
    name: subject.name,
    topics: (subject.curricula[0]?.topics ?? []).map((topic) => ({
      id: topic.id,
      name: topic.name,
      subtopics: topic.subtopics.map((sub) => {
        const mastery = masteryBySubtopic.get(sub.id);
        return {
          id: sub.id,
          name: sub.name,
          questionCount: sub._count.questions,
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
