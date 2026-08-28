import { SignupForm } from "@/components/auth/signup-form";
import Link from "next/link";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F7FA] px-4 py-12 dark:bg-gray-950">
      <Link href="/" className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 font-bold text-white">
          IB
        </div>
        <span className="text-xl font-bold">InstallBase</span>
      </Link>
      <SignupForm />
    </div>
  );
}
