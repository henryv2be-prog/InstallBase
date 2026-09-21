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
