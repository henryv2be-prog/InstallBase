import Link from "next/link";
import { KfAuthForm } from "@/components/kasifind/kf-auth-form";

export default function KfLoginPage() {
  return (
    <div className="kf-auth-shell space-y-4 kf-animate-in">
      <h1 className="kf-hero-title text-2xl">Provider sign in</h1>
      <p className="kf-section-sub">
        Manage your KasiFind listing. Browsing the marketplace does not require an account.
      </p>
      <KfAuthForm mode="login" />
      <div className="kf-auth-benefits">
        <p className="font-semibold text-[var(--kf-charcoal)]">Why providers use KasiFind</p>
        <ul>
          <li>Free listing — reach customers in your area</li>
          <li>WhatsApp and call buttons on your profile</li>
          <li>Save drafts and publish when you are ready</li>
        </ul>
      </div>
      <p className="text-center text-sm">
        New here?{" "}
        <Link href="/register" className="kf-link underline">
          Register
        </Link>
      </p>
    </div>
  );
}
