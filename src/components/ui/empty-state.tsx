import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: { label: string; href: string };
  children?: ReactNode;
  variant?: "default" | "brag";
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  children,
  variant = "default",
}: EmptyStateProps) {
  const iconClass =
    variant === "brag"
      ? "bg-brag/15 text-brag"
      : "bg-blue-500/10 text-blue-600 dark:text-cyan-400";

  return (
    <div className="glass-card rounded-2xl border border-dashed border-border p-10 text-center">
      {Icon && (
        <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl ${iconClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      )}
      <p className="font-semibold text-foreground">{title}</p>
      {description && <p className="mt-2 text-sm text-muted">{description}</p>}
      {children}
      {action && (
        <Button asChild className="mt-4" size="sm">
          <Link href={action.href}>{action.label}</Link>
        </Button>
      )}
    </div>
  );
}
