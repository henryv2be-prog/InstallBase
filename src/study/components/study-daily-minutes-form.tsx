"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateDailyStudyMinutes } from "@/study/lib/study-coach-actions";

type Props = {
  initialMinutes: number;
  label: string;
  saveLabel: string;
};

export function StudyDailyMinutesForm({ initialMinutes, label, saveLabel }: Props) {
  const router = useRouter();
  const [minutes, setMinutes] = useState(initialMinutes);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        startTransition(async () => {
          await updateDailyStudyMinutes(minutes);
          router.refresh();
        });
      }}
    >
      <label className="block space-y-2">
        <span className="text-sm font-bold">{label}</span>
        <input
          type="range"
          min={15}
          max={180}
          step={15}
          value={minutes}
          onChange={(e) => setMinutes(Number(e.target.value))}
          className="w-full"
        />
        <p className="text-sm font-extrabold tabular-nums study-text-emphasis">{minutes} min</p>
      </label>
      <button type="submit" className="study-btn study-btn-ghost study-touch-target w-full" disabled={pending}>
        {saveLabel}
      </button>
    </form>
  );
}
