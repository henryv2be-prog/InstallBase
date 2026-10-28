"use client";

import { cn } from "@/lib/utils";

export function GlassPickerShell({
  children,
  className,
  label,
}: {
  children: React.ReactNode;
  className?: string;
  label?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-white/15 bg-black/40 p-2 shadow-lg backdrop-blur-xl",
        "dark:border-white/10 dark:bg-black/45",
        className
      )}
    >
      {label ? (
        <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-white/70">{label}</p>
      ) : null}
      <div className="flex gap-2 overflow-x-auto pb-0.5 snap-x snap-mandatory [-webkit-overflow-scrolling:touch] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {children}
      </div>
    </div>
  );
}

export function GlassPickerChip({
  active,
  label,
  sub,
  disabled,
  onClick,
  icon,
}: {
  active: boolean;
  label: string;
  sub?: string;
  disabled?: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-[3.75rem] min-w-[6.5rem] max-w-[9rem] shrink-0 snap-start flex-col justify-center rounded-xl border px-3 py-2.5 text-left transition-all touch-manipulation motion-reduce:transition-none",
        active
          ? "scale-[1.03] border-primary/80 bg-primary/25 ring-2 ring-primary/40 shadow-md"
          : "border-white/15 bg-white/10 active:scale-[0.98] hover:bg-white/15",
        disabled && "pointer-events-none opacity-45"
      )}
    >
      {icon ? <span className="mb-1 text-white/90">{icon}</span> : null}
      <span className="line-clamp-2 text-sm font-semibold leading-tight text-white">{label}</span>
      {sub ? <span className="mt-0.5 line-clamp-1 text-[10px] text-white/65">{sub}</span> : null}
    </button>
  );
}
