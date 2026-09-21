import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title?: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
};

export function StudyShell({ title, subtitle, backHref, backLabel, children }: Props) {
  return (
    <div className="study-shell mx-auto flex min-h-dvh max-w-lg flex-col px-4 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))]">
      <header className="mb-5 flex items-center gap-3">
        {backHref ? (
          <Link href={backHref} className="study-back study-touch-target shrink-0">
            ← {backLabel ?? "Back"}
          </Link>
        ) : (
          <div className="study-logo-mark" aria-hidden>
            12
          </div>
        )}
        <div className="min-w-0 flex-1">
          {title ? <h1 className="truncate text-lg font-bold tracking-tight">{title}</h1> : null}
          {subtitle ? <p className="truncate text-xs text-[var(--study-muted)]">{subtitle}</p> : null}
        </div>
      </header>
      {children}
    </div>
  );
}
