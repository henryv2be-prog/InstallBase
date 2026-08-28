import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center tech-bg px-4 py-8">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>
      <Link href="/" className="relative z-10 mb-8">
        <Logo size="lg" />
      </Link>
      <div className="relative z-10 w-full max-w-md animate-fade-in">
        <LoginForm />
      </div>
    </div>
  );
}
