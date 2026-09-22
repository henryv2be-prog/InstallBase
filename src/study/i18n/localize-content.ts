import type { StudyLocale } from "@/study/i18n/types";
import {
  AF_SUBJECT_LABELS,
  AF_SUBTOPIC_LABELS,
  AF_TOPIC_LABELS,
} from "@/study/i18n/content-labels-af";

export function localizeSubjectName(
  locale: StudyLocale,
  subjectSlug: string,
  fallback: string,
): string {
  if (locale !== "af") return fallback;
  return AF_SUBJECT_LABELS[subjectSlug] ?? fallback;
}

export function localizeTopicName(
  locale: StudyLocale,
  subjectSlug: string,
  topicSlug: string,
  fallback: string,
): string {
  if (locale !== "af") return fallback;
  return AF_TOPIC_LABELS[`${subjectSlug}:${topicSlug}`] ?? fallback;
}

export function localizeSubtopicName(
  locale: StudyLocale,
  subjectSlug: string,
  topicSlug: string,
  subtopicSlug: string,
  fallback: string,
): string {
  if (locale !== "af") return fallback;
  return AF_SUBTOPIC_LABELS[`${subjectSlug}:${topicSlug}:${subtopicSlug}`] ?? fallback;
}

export type CurriculumSlugRow = {
  subjectSlug: string;
  subjectName: string;
  topicSlug: string;
  topicName: string;
  subtopicSlug: string;
  subtopicName: string;
};

export function localizeCurriculumRow(
  locale: StudyLocale,
  row: CurriculumSlugRow,
): { subjectName: string; topicName: string; subtopicName: string } {
  return {
    subjectName: localizeSubjectName(locale, row.subjectSlug, row.subjectName),
    topicName: localizeTopicName(locale, row.subjectSlug, row.topicSlug, row.topicName),
    subtopicName: localizeSubtopicName(
      locale,
      row.subjectSlug,
      row.topicSlug,
      row.subtopicSlug,
      row.subtopicName,
    ),
  };
}

/** From a subtopic graph include (subject → topic → subtopic). */
export function localizeFromSubtopicGraph(
  locale: StudyLocale,
  subtopic: {
    slug: string;
    name: string;
    topic: {
      slug: string;
      name: string;
      curriculum: { subject: { slug: string; name: string } };
    };
  },
): { subjectName: string; topicName: string; subtopicName: string } {
  const subject = subtopic.topic.curriculum.subject;
  return localizeCurriculumRow(locale, {
    subjectSlug: subject.slug,
    subjectName: subject.name,
    topicSlug: subtopic.topic.slug,
    topicName: subtopic.topic.name,
    subtopicSlug: subtopic.slug,
    subtopicName: subtopic.name,
  });
}
