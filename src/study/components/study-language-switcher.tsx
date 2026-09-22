"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setStudyLocale } from "@/study/i18n/locale-actions";
import { useStudyLocale } from "@/study/components/study-locale-provider";
import type { StudyLocale } from "@/study/i18n/types";

const OPTIONS: { id: StudyLocale; label: string }[] = [
  { id: "en", label: "English" },
  { id: "af", label: "Afrikaans" },
];

export function StudyLanguageSwitcher() {
  const locale = useStudyLocale();
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function select(next: StudyLocale) {
    if (next === locale || pending) return;
    startTransition(async () => {
      await setStudyLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2">
      {OPTIONS.map((opt) => {
        const active = opt.id === locale;
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
