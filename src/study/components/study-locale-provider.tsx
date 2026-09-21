"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDictionary } from "@/study/i18n/get-dictionary";
import {
  localizeSubjectName,
  localizeSubtopicName,
  localizeTopicName,
} from "@/study/i18n/localize-content";
import type { StudyLocale, StudyMessages } from "@/study/i18n/types";

type Ctx = { locale: StudyLocale; t: StudyMessages };

const StudyLocaleContext = createContext<Ctx | null>(null);

/** Provides UI strings on the client — locale only crosses the server boundary. */
export function StudyLocaleProvider({
  locale,
  children,
}: {
  locale: StudyLocale;
  children: ReactNode;
}) {
  const t = useMemo(() => getDictionary(locale), [locale]);
  return (
    <StudyLocaleContext.Provider value={{ locale, t }}>{children}</StudyLocaleContext.Provider>
  );
}

export function useStudyT(): StudyMessages {
  const ctx = useContext(StudyLocaleContext);
  if (!ctx) {
    throw new Error("useStudyT must be used within StudyLocaleProvider");
  }
  return ctx.t;
}

export function useStudyLocale(): StudyLocale {
  const ctx = useContext(StudyLocaleContext);
  if (!ctx) {
    throw new Error("useStudyLocale must be used within StudyLocaleProvider");
  }
  return ctx.locale;
}

/** Localized subject / topic / subtopic labels for client UI. */
export function useStudyContentLabels() {
  const locale = useStudyLocale();
  return useMemo(
    () => ({
      subject: (slug: string, fallback: string) => localizeSubjectName(locale, slug, fallback),
      topic: (subjectSlug: string, topicSlug: string, fallback: string) =>
        localizeTopicName(locale, subjectSlug, topicSlug, fallback),
      subtopic: (subjectSlug: string, topicSlug: string, subtopicSlug: string, fallback: string) =>
        localizeSubtopicName(locale, subjectSlug, topicSlug, subtopicSlug, fallback),
    }),
    [locale],
  );
}
