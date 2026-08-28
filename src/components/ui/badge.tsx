import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "secondary" | "brag" | "question" | "success" | "outline";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300": variant === "default",
          "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300": variant === "secondary",
          "bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300": variant === "brag",
          "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300": variant === "question",
          "bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300": variant === "success",
          "border border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-400": variant === "outline",
        },
        className
      )}
      {...props}
    />
  );
}

export function ReputationBadge({ score, level }: { score: number; level: string }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-300">
      ⭐ {score.toLocaleString()}
    </span>
  );
}

export function VerifiedBadge() {
  return (
    <span className="inline-flex items-center text-blue-500" title="Verified installer">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </span>
  );
}
