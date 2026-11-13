import Link from "next/link";
import { PlusCircle, ShieldCheck } from "lucide-react";
import { loginPathWithNext, sanitizeAuthNextPath } from "@/lib/kasifind/auth-redirect";

type Props = {
  searchParams?: Promise<{ next?: string }>;
};

export default async function KfRegisterPage({ searchParams }: Props) {
  const resolved = searchParams ? await searchParams : {};
  const nextPath = resolved.next ?? null;
  const loginHref =
    nextPath && nextPath.length > 0
      ? loginPathWithNext(sanitizeAuthNextPath(nextPath, "/account/listing"))
      : "/login";

  return (
    <div className="kf-auth-shell space-y-4 kf-animate-in">
      <h1 className="kf-hero-title text-2xl">List your business on KasiFind</h1>
      <p className="kf-section-sub">
        Build your listing first — we only ask you to register when you are ready to add photos and
        publish.
      </p>
      <div className="kf-alert-info flex items-start gap-2 text-sm">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        <span>
          No company registration required. Your email is only used to manage your listing — customers
          contact you on WhatsApp or phone.
        </span>
      </div>
      <Link href="/account/listing" className="kf-btn kf-btn-primary w-full text-base">
        <PlusCircle className="h-5 w-5" aria-hidden />
        Start your free listing
      </Link>
      <div className="kf-auth-benefits">
        <p className="font-semibold text-[var(--kf-charcoal)]">What happens next</p>
        <ul>
          <li>Guided steps — business info, location, and services</li>
          <li>Create your account on the Photos step</li>
          <li>Add photos of your work to build trust</li>
          <li>Publish for review — usually live within 1–2 days</li>
        </ul>
      </div>
      <p className="text-center text-sm">
        Already registered?{" "}
        <Link href={loginHref} className="kf-link underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
