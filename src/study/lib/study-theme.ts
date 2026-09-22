export type StudyTheme = "dark" | "light";

export function parseStudyTheme(raw: string | undefined | null): StudyTheme | null {
  if (raw === "dark" || raw === "light") return raw;
  return null;
}
