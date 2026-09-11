import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { safeAuthNext } from "@/lib/auth-urls";

export const metadata = { title: "Sign up" };

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: nextParam } = await searchParams;
  const next = safeAuthNext(nextParam);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center tech-bg px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="relative z-10 mb-8">
        <Logo size="lg" />
      </Link>
      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <SignupForm next={next} />
        <p className="mt-6 text-center text-sm text-muted">
          Or{" "}
          <Link href="/feed" className="font-semibold text-blue-600 hover:underline dark:text-cyan-400">
            browse the live site as a guest
          </Link>
        </p>
      </div>
    </div>
  );
}
