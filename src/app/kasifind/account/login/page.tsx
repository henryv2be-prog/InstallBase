import Link from "next/link";
import { KfAuthForm } from "@/components/kasifind/kf-auth-form";

export default function KfLoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4">
      <h1 className="text-2xl font-bold text-[var(--kf-green-dark)]">Provider sign in</h1>
      <p className="text-sm text-[var(--kf-muted)]">
        Manage your KasiFind listing. Browsing the marketplace does not require an account.
      </p>
      <KfAuthForm mode="login" />
      <p className="text-center text-sm">
        New here?{" "}
        <Link href="/kasifind/account/register" className="font-semibold text-[var(--kf-green-dark)] underline">
          Register
        </Link>
      </p>
    </div>
  );
}
