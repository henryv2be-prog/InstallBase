import type { MemberTier } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";
import { getMemberTierLabel } from "@/lib/membership";

export { ReputationBadge } from "@/components/ui/reputation-badge";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "brag" | "question" | "success" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 font-mono text-[11px] font-semibold uppercase tracking-wide transition-colors",
        {
          "bg-blue-500/15 text-blue-700 ring-1 ring-blue-500/20 dark:text-cyan-400 dark:ring-cyan-500/20": variant === "default",
          "bg-slate-500/10 text-slate-600 ring-1 ring-slate-500/15 dark:text-slate-400": variant === "secondary",
          "bg-orange-500/15 text-orange-700 ring-1 ring-orange-500/25 dark:text-orange-400": variant === "brag",
          "bg-purple-500/15 text-purple-700 ring-1 ring-purple-500/20 dark:text-purple-400": variant === "question",
          "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-400": variant === "success",
          "border border-border bg-card/50 text-muted": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center text-blue-500 dark:text-cyan-400" title="Verified installer">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  );
}

export function MemberTierBadge({
  tier,
  compact = false,
  className,
}: {
  tier: MemberTier;
  compact?: boolean;
  className?: string;
}) {
  const label = getMemberTierLabel(tier);
  if (!label) return null;

  const isFounding = tier === "FOUNDING_MEMBER";

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-mono font-semibold uppercase tracking-wide ring-1",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-0.5 text-[11px]",
        isFounding
          ? "bg-amber-500/15 text-amber-800 ring-amber-500/25 dark:text-amber-300"
          : "bg-slate-500/10 text-slate-700 ring-slate-500/20 dark:text-slate-300",
        className
      )}
      title={label}
    >
      {isFounding ? "Founding Member" : "Early Builder"}
    </span>
  );
}
