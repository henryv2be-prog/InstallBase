"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStudyTheme } from "@/study/lib/theme-actions";
import { useStudyT } from "@/study/components/study-locale-provider";
import type { StudyTheme } from "@/study/lib/study-theme";

type Props = {
  current: StudyTheme;
};

export function StudyThemeSwitcher({ current }: Props) {
  const t = useStudyT();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const options: { id: StudyTheme; label: string }[] = [
    { id: "dark", label: t.profile.themeDark },
    { id: "light", label: t.profile.themeLight },
  ];

  function select(next: StudyTheme) {
    if (next === current || pending) return;
    startTransition(async () => {
      await setStudyTheme(next);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {options.map((opt) => {
        const active = opt.id === current;
        return (
          <button
            key={opt.id}
            type="button"
            disabled={pending}
            onClick={() => select(opt.id)}
            className={`study-btn flex-1 text-sm ${active ? "study-btn-primary" : "study-btn-ghost"}`}
            aria-pressed={active}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
