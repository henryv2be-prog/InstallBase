"use client";

import { useEffect } from "react";

/** Takes over document chrome so InstallBase body styles do not show through on /study. */
export function StudyBodyChrome() {
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    html.classList.add("study-coach-active");
    body.classList.add("study-coach-active");
    return () => {
      html.classList.remove("study-coach-active");
      body.classList.remove("study-coach-active");
    };
  }, []);

  return null;
}
