import Link from "next/link";
import { KfAuthForm } from "@/components/kasifind/kf-auth-form";

export default function KfLoginPage() {
  return (
    <div className="mx-auto max-w-md space-y-4 kf-animate-in">
      <h1 className="kf-hero-title text-2xl">Provider sign in</h1>
      <p className="kf-section-sub">
        Manage your KasiFind listing. Browsing the marketplace does not require an account.
      </p>
      <KfAuthForm mode="login" />
      <p className="text-center text-sm">
        New here?{" "}
        <Link href="/register" className="font-semibold text-[var(--kf-green-dark)] underline">
          Register
        </Link>
      </p>
    </div>
  );
}
