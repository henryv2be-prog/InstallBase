import type { StudyLocale, StudyMessages } from "@/study/i18n/types";
import { af } from "@/study/i18n/messages/af";
import { en } from "@/study/i18n/messages/en";

const dictionaries: Record<StudyLocale, StudyMessages> = { en, af };

export function getDictionary(locale: StudyLocale): StudyMessages {
  return dictionaries[locale] ?? en;
}
