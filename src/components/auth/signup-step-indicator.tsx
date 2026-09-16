"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Account" },
  { id: 2, label: "Your goals" },
  { id: 3, label: "Profile" },
] as const;

interface SignupStepIndicatorProps {
  step: number;
}

export function SignupStepIndicator({ step }: SignupStepIndicatorProps) {
  return (
    <div className="mt-4 space-y-3">
      <div className="flex items-center gap-2">
        {STEPS.map((item, index) => {
          const done = step > item.id;
          const active = step === item.id;
          return (
            <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2">
              <div
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors",
                  done && "bg-blue-600 text-white dark:bg-cyan-500",
                  active && !done && "bg-blue-600 text-white ring-4 ring-blue-500/20 dark:bg-cyan-500 dark:ring-cyan-500/20",
                  !done && !active && "border border-border bg-card text-muted"
                )}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : item.id}
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 flex-1 rounded-full transition-colors",
                    step > item.id ? "bg-blue-600 dark:bg-cyan-500" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      <p className="text-center text-xs text-muted">
        Step {step} of 3 —{" "}
        <span className="font-medium text-foreground">{STEPS[step - 1]?.label}</span>
      </p>
    </div>
  );
}
