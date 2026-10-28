import Link from "next/link";
import { KfAuthForm } from "@/components/kasifind/kf-auth-form";

export default function KfRegisterPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-[var(--kf-green-dark)]">Register your business</h1>
      <p className="text-sm text-[var(--kf-muted)]">
        No company registration required — just your trading name and contact details.
      </p>
      <KfAuthForm mode="register" />
      <p className="text-center text-sm">
        Already registered?{" "}
        <Link href="/kasifind/account/login" className="font-semibold text-[var(--kf-green-dark)] underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
