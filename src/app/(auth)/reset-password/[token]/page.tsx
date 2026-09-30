import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata = { title: "Reset password" };

export default async function ResetPasswordTokenPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center tech-bg px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="relative z-10 mb-8">
        <Logo size="lg" />
      </Link>
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <Suspense
          fallback={
            <div className="rounded-xl border border-border bg-card/80 p-6 text-center text-sm text-muted">
              Loading…
            </div>
          }
        >
          <ResetPasswordForm token={decodeURIComponent(token)} />
        </Suspense>
      </div>
    </div>
  );
}
