"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { StudyLocale, StudyMessages } from "@/study/i18n/types";

type Ctx = { locale: StudyLocale; t: StudyMessages };

const StudyLocaleContext = createContext<Ctx | null>(null);

export function StudyLocaleProvider({
  locale,
  t,
  children,
}: {
  locale: StudyLocale;
  t: StudyMessages;
  children: ReactNode;
}) {
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
