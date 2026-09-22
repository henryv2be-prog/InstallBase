"use client";

import { useLayoutEffect } from "react";
import type { StudyTheme } from "@/study/lib/study-theme";

type Props = {
  theme: StudyTheme;
};

/** Takes over document chrome so InstallBase body styles do not show through on /study. */
export function StudyBodyChrome({ theme }: Props) {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("study-coach-active");
    body.classList.add("study-coach-active");
    html.classList.remove("study-coach-theme-dark", "study-coach-theme-light");
    html.classList.add(theme === "light" ? "study-coach-theme-light" : "study-coach-theme-dark");
    return () => {
      html.classList.remove("study-coach-active", "study-coach-theme-dark", "study-coach-theme-light");
      body.classList.remove("study-coach-active");
    };
  }, [theme]);

  return null;
}
