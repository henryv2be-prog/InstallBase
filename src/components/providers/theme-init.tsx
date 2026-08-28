"use client";

import { useLayoutEffect } from "react";

export type Theme = "light" | "dark";

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  localStorage.setItem("installbase-theme", theme);
}

export function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("installbase-theme") as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return "dark";
}

/** Applies saved theme before paint — no inline script needed (React 19 safe). */
export function ThemeInit() {
  useLayoutEffect(() => {
    applyTheme(getStoredTheme());
  }, []);

  return null;
}
