"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { STUDY_LOCALE_COOKIE } from "@/study/lib/constants";
import { parseStudyLocale } from "@/study/i18n/get-locale";
import type { StudyLocale } from "@/study/i18n/types";

export async function setStudyLocale(locale: StudyLocale) {
  if (!parseStudyLocale(locale)) {
    return { ok: false as const, error: "Unsupported language." };
  }

  const cookieStore = await cookies();
  cookieStore.set(STUDY_LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/study", "layout");
  return { ok: true as const };
}
