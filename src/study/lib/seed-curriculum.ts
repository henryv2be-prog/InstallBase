import { StudyContentSourceKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  GRADE_12_CURRICULUM_STARTER,
  GRADE_12_SUBJECT_STUBS,
} from "@/study/data/curriculum-starter";

export async function seedStudyCurriculum() {
  for (const stub of GRADE_12_SUBJECT_STUBS) {
    await prisma.studySubject.upsert({
      where: { slug: stub.slug },
      create: {
        slug: stub.slug,
        name: stub.name,
        grade: 12,
        sortOrder: stub.sortOrder,
        active: true,
        description: "Grade 12 NSC subject — curriculum topics coming soon (prototype).",
      },
      update: {
        name: stub.name,
        sortOrder: stub.sortOrder,
        active: true,
      },
    });
  }

  for (const subjectDef of GRADE_12_CURRICULUM_STARTER) {
    const subject = await prisma.studySubject.upsert({
      where: { slug: subjectDef.slug },
      create: {
        slug: subjectDef.slug,
        name: subjectDef.name,
        grade: 12,
        sortOrder: subjectDef.sortOrder,
        active: true,
        description: subjectDef.description,
      },
      update: {
        name: subjectDef.name,
        sortOrder: subjectDef.sortOrder,
        description: subjectDef.description,
        active: true,
      },
    });

    const curriculum = await prisma.studyCurriculum.upsert({
      where: { id: `${subject.id}-caps-starter` },
      create: {
        id: `${subject.id}-caps-starter`,
        subjectId: subject.id,
        name: "CAPS Grade 12 (starter slice)",
        sourceKind: StudyContentSourceKind.OFFICIAL_CURRICULUM,
        sourceTitle: subjectDef.sourceTitle,
        sourceUrl: subjectDef.sourceUrl,
        versionLabel: subjectDef.versionLabel,
        isComplete: false,
      },
      update: {
        sourceTitle: subjectDef.sourceTitle,
        sourceUrl: subjectDef.sourceUrl,
        versionLabel: subjectDef.versionLabel,
        isComplete: false,
      },
    });

    for (const topicDef of subjectDef.topics) {
      const topic = await prisma.studyTopic.upsert({
        where: {
          curriculumId_slug: {
            curriculumId: curriculum.id,
            slug: topicDef.slug,
          },
        },
        create: {
          curriculumId: curriculum.id,
          slug: topicDef.slug,
          name: topicDef.name,
          sortOrder: topicDef.sortOrder,
          importance: topicDef.importance ?? 1,
        },
        update: {
          name: topicDef.name,
          sortOrder: topicDef.sortOrder,
          importance: topicDef.importance ?? 1,
        },
      });

      for (const sub of topicDef.subtopics) {
        await prisma.studySubtopic.upsert({
          where: {
            topicId_slug: {
              topicId: topic.id,
              slug: sub.slug,
            },
          },
          create: {
            topicId: topic.id,
            slug: sub.slug,
            name: sub.name,
            sortOrder: sub.sortOrder,
          },
          update: {
            name: sub.name,
            sortOrder: sub.sortOrder,
          },
        });
      }
    }
  }
}
