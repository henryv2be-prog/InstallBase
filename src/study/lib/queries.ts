import "server-only";
import { prisma } from "@/lib/prisma";

export type StudySubjectWithCurriculum = Awaited<ReturnType<typeof getStudySubjectsWithTopics>>[number];

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
