"use client";

import type { LucideIcon } from "lucide-react";
import {
  Briefcase,
  Building2,
  Camera,
  Check,
  Search,
  Users,
} from "lucide-react";
import {
  PLATFORM_PURPOSES,
  type PlatformPurposeId,
} from "@/lib/platform-roles";
import { cn } from "@/lib/utils";

const PURPOSE_ICONS: Record<PlatformPurposeId, LucideIcon> = {
  show_work: Camera,
  find_work: Briefcase,
  company_rep: Building2,
  hire: Users,
  find_pro: Search,
};

const PURPOSE_ACCENTS: Record<PlatformPurposeId, string> = {
  show_work:
    "bg-gradient-to-br from-blue-500/15 to-cyan-500/15 text-blue-600 ring-blue-500/20 dark:text-cyan-400",
  find_work:
    "bg-gradient-to-br from-violet-500/15 to-purple-500/10 text-violet-600 ring-violet-500/20 dark:text-violet-400",
  company_rep:
    "bg-gradient-to-br from-slate-500/15 to-indigo-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
  hire:
    "bg-gradient-to-br from-emerald-500/15 to-teal-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-400",
  find_pro:
    "bg-gradient-to-br from-amber-500/15 to-orange-500/10 text-amber-700 ring-amber-500/20 dark:text-amber-400",
};

interface PlatformPurposePickerProps {
  value: PlatformPurposeId[];
  onChange: (next: PlatformPurposeId[]) => void;
  disabled?: boolean;
  /** Use label+hidden checkbox for settings forms */
  mode?: "button" | "checkbox";
}

export function PlatformPurposePicker({
  value,
  onChange,
  disabled = false,
  mode = "button",
}: PlatformPurposePickerProps) {
  const toggle = (id: PlatformPurposeId) => {
    if (disabled) return;
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  };

  return (
    <div className="grid gap-2.5 sm:grid-cols-1">
      {PLATFORM_PURPOSES.map((purpose) => {
        const selected = value.includes(purpose.id);
        const Icon = PURPOSE_ICONS[purpose.id];
        const accent = PURPOSE_ACCENTS[purpose.id];

        const cardClass = cn(
          "group relative flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200",
          selected
            ? "border-blue-500/50 bg-blue-500/[0.06] shadow-sm ring-2 ring-blue-500/15 dark:bg-blue-500/10"
            : "border-border bg-card/50 hover:border-blue-400/35 hover:bg-card/80",
          disabled && "pointer-events-none opacity-60"
        );

        const content = (
          <>
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ring-1 ring-inset transition-transform duration-200",
                accent,
                selected && "scale-105"
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
            </div>
            <span className="min-w-0 flex-1 pt-0.5">
              <span className="block text-sm font-semibold text-foreground">{purpose.title}</span>
              <span className="mt-1 block text-xs leading-relaxed text-muted">
                {purpose.description}
              </span>
            </span>
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                selected
                  ? "border-blue-600 bg-blue-600 text-white dark:border-cyan-500 dark:bg-cyan-500"
                  : "border-border bg-background/80 text-transparent group-hover:border-blue-400/40"
              )}
              aria-hidden
            >
              <Check className="h-3.5 w-3.5" strokeWidth={3} />
            </span>
          </>
        );

        if (mode === "checkbox") {
          return (
            <label key={purpose.id} className={cn(cardClass, "cursor-pointer")}>
              <input
                type="checkbox"
                name={name}
                value={purpose.id}
                checked={selected}
                onChange={() => toggle(purpose.id)}
                disabled={disabled}
                className="sr-only"
              />
              {content}
            </label>
          );
        }

        return (
          <button
            key={purpose.id}
            type="button"
            onClick={() => toggle(purpose.id)}
            disabled={disabled}
            aria-pressed={selected}
            className={cardClass}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
