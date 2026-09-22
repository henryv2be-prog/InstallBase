"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { STUDY_THEME_COOKIE } from "@/study/lib/constants";
import { parseStudyTheme, type StudyTheme } from "@/study/lib/study-theme";

export async function setStudyTheme(theme: StudyTheme) {
  if (!parseStudyTheme(theme)) {
    return { ok: false as const, error: "Unsupported theme." };
  }

  const cookieStore = await cookies();
  cookieStore.set(STUDY_THEME_COOKIE, theme, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/study", "layout");
  return { ok: true as const };
}
