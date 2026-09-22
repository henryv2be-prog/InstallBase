import "server-only";
import { cookies, headers } from "next/headers";
import { STUDY_THEME_COOKIE } from "@/study/lib/constants";
import { parseStudyTheme, type StudyTheme } from "@/study/lib/study-theme";

export type { StudyTheme } from "@/study/lib/study-theme";

export async function getStudyTheme(): Promise<StudyTheme> {
  const cookieStore = await cookies();
  const fromCookie = parseStudyTheme(cookieStore.get(STUDY_THEME_COOKIE)?.value);
  if (fromCookie) return fromCookie;

  const headerStore = await headers();
  const prefersDark = headerStore.get("sec-ch-prefers-color-scheme");
  if (prefersDark === "light") return "light";
  if (prefersDark === "dark") return "dark";

  return "dark";
}
