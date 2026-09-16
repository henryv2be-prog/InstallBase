import { formatNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  highlight?: boolean;
  className?: string;
}

export function AdminStatCard({ label, value, highlight, className }: AdminStatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 sm:p-5",
        highlight && "border-amber-500/40 bg-amber-500/5",
        className
      )}
    >
      <p className="text-xs text-muted sm:text-sm">{label}</p>
      <p className="mt-1 text-2xl font-bold sm:text-3xl">
        {typeof value === "number" ? formatNumber(value) : value}
      </p>
    </div>
  );
}
