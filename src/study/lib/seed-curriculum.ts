import { StudyContentSourceKind } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { GRADE_12_CURRICULUM_STARTER } from "@/study/data/curriculum-starter";
import {
  GRADE_12_NSC_SUBJECT_CATALOG,
  GRADE_12_SUBJECT_BY_SLUG,
} from "@/study/data/grade-12-subject-catalog";

const STARTER_SLUGS = new Set(GRADE_12_CURRICULUM_STARTER.map((s) => s.slug));

/** Legacy slug from early prototype seeds — keep inactive to avoid duplicates. */
const DEPRECATED_SUBJECT_SLUGS = ["isiZulu-home-language"];

export async function seedStudyCurriculum() {
  for (const entry of GRADE_12_NSC_SUBJECT_CATALOG) {
    const catalogMeta = GRADE_12_SUBJECT_BY_SLUG[entry.slug];
    const hasStarter = STARTER_SLUGS.has(entry.slug);
    await prisma.studySubject.upsert({
      where: { slug: entry.slug },
      create: {
        slug: entry.slug,
        name: entry.name,
        grade: 12,
        sortOrder: entry.sortOrder,
        active: true,
        description: hasStarter
          ? `Grade 12 ${entry.name} (CAPS FET) — partial topic map loaded.`
          : "Grade 12 NSC subject — select for exams; CAPS topic map coming soon.",
      },
      update: {
        name: entry.name,
        sortOrder: entry.sortOrder,
        active: true,
        description: hasStarter
          ? `Grade 12 ${entry.name} (CAPS FET) — partial topic map loaded.`
          : "Grade 12 NSC subject — select for exams; CAPS topic map coming soon.",
      },
    });
    void catalogMeta;
  }

  if (DEPRECATED_SUBJECT_SLUGS.length > 0) {
    await prisma.studySubject.updateMany({
      where: { slug: { in: DEPRECATED_SUBJECT_SLUGS } },
      data: { active: false },
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
