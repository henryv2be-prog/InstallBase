import "server-only";
import { cookies, headers } from "next/headers";
import { STUDY_LOCALE_COOKIE } from "@/study/lib/constants";
import type { StudyLocale } from "@/study/i18n/types";
import { getDictionary } from "@/study/i18n/get-dictionary";

export function parseStudyLocale(raw: string | undefined | null): StudyLocale | null {
  if (raw === "en" || raw === "af") return raw;
  return null;
}

export async function getStudyLocale(): Promise<StudyLocale> {
  const cookieStore = await cookies();
  const fromCookie = parseStudyLocale(cookieStore.get(STUDY_LOCALE_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  const accept = headerStore.get("accept-language")?.toLowerCase() ?? "";
  if (accept.includes("af")) return "af";

  return "en";
}

export async function getStudyMessages() {
  const locale = await getStudyLocale();
  return { locale, t: getDictionary(locale) };
}
