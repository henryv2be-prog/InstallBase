"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { getDictionary } from "@/study/i18n/get-dictionary";
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
