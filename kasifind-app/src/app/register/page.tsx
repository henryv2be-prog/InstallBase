import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { KfAuthForm } from "@/components/kasifind/kf-auth-form";

export default function KfRegisterPage() {
  return (
    <div className="kf-auth-shell space-y-4 kf-animate-in">
      <h1 className="kf-hero-title text-2xl">Register your business</h1>
      <p className="kf-section-sub">
        No company registration required — just your trading name and contact details.
      </p>
      <div className="kf-alert-info flex items-start gap-2 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>Your email is only used to manage your listing — customers contact you on WhatsApp or phone.</span>
      </div>
      <KfAuthForm mode="register" />
      <div className="kf-auth-benefits">
        <p className="font-semibold text-[var(--kf-charcoal)]">What happens next</p>
        <ul>
          <li>One free listing per account — update it anytime instead of creating duplicates</li>
          <li>Create your listing in a few guided steps</li>
          <li>Add photos of your work to build trust</li>
          <li>Publish for review — usually live within 1–2 days</li>
        </ul>
      </div>
      <p className="text-center text-sm">
        Already registered?{" "}
        <Link href="/login" className="kf-link underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
