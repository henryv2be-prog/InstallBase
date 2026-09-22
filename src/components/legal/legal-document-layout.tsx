import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LegalFooterLinks } from "@/components/legal/legal-footer-links";
import { cn } from "@/lib/utils";

interface LegalDocumentLayoutProps {
  title: string;
  version: string;
  effectiveDate: string;
  children: React.ReactNode;
  className?: string;
}

export function LegalDocumentLayout({
  title,
  version,
  effectiveDate,
  children,
  className,
}: LegalDocumentLayoutProps) {
  return (
    <div className="relative min-h-dvh tech-bg">
      <header className="sticky top-0 z-40 border-b border-border bg-card/80 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-3xl items-center justify-between gap-3 px-4 sm:h-16">
          <Link href="/" className="min-w-0 shrink">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/feed"
              className="hidden text-sm font-medium text-muted hover:text-foreground sm:inline"
            >
              Feed
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className={cn("mx-auto max-w-3xl px-4 py-8 pb-16 sm:px-6", className)}>
        <p className="text-xs font-medium uppercase tracking-wide text-muted">InstallBase legal</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
        <p className="mt-2 text-sm text-muted">
          Version {version} · Effective {effectiveDate}
        </p>
        <article className="prose prose-slate dark:prose-invert mt-8 max-w-none prose-headings:scroll-mt-24 prose-p:leading-relaxed prose-li:leading-relaxed">
          {children}
        </article>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <LegalFooterLinks className="justify-center" />
          <p className="mt-4 text-xs text-muted">© {new Date().getFullYear()} InstallBase</p>
        </div>
      </footer>
    </div>
  );
}
