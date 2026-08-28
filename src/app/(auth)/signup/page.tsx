import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center tech-bg px-4 py-12">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="relative z-10 mb-8">
        <Logo size="lg" />
      </Link>
      <div className="relative z-10 w-full max-w-lg animate-fade-in">
        <SignupForm />
      </div>
    </div>
  );
}
