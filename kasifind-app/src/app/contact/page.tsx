import type { Metadata } from "next";
import { Mail, MessageCircle } from "lucide-react";
import { KfLegalPageShell } from "@/components/kasifind/kf-legal-page-shell";
import {
  KF_SUPPORT_EMAIL,
  KF_SUPPORT_WHATSAPP_DISPLAY,
  kfSupportMailtoUrl,
  kfSupportWhatsAppUrl,
} from "@/lib/kasifind/support-contact";

export const metadata: Metadata = {
  title: "Contact & Support",
  description:
    "Get help with KasiFind — email or WhatsApp the team behind this South African local business discovery platform.",
};

export default function ContactPage() {
  return (
    <KfLegalPageShell title="Contact & Support">
      <p>
        Need a hand with KasiFind? Have a question, spotted something that isn&apos;t working, or need
        help creating your business listing? We&apos;re happy to help.
      </p>
      <p>
        KasiFind is independently operated, so when you contact us you&apos;re reaching the people
        actually behind the platform.
      </p>

      <div className="kf-contact-cards mt-6 grid gap-3 sm:grid-cols-2">
        <a
          href={kfSupportMailtoUrl("KasiFind support")}
          className="kf-card kf-contact-card kf-glow-border flex flex-col gap-2 p-5 no-underline"
        >
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--kf-forest)]">
            <Mail className="h-5 w-5" aria-hidden />
            Email support
          </span>
          <span className="text-sm text-[var(--kf-charcoal)] break-all">{KF_SUPPORT_EMAIL}</span>
          <span className="text-xs text-[var(--kf-muted)]">Tap to open your email app</span>
        </a>
        <a
          href={kfSupportWhatsAppUrl()}
          target="_blank"
          rel="noopener noreferrer"
          className="kf-card kf-contact-card kf-glow-border flex flex-col gap-2 p-5 no-underline"
        >
          <span className="inline-flex items-center gap-2 font-semibold text-[var(--kf-forest)]">
            <MessageCircle className="h-5 w-5" aria-hidden />
            WhatsApp support
          </span>
          <span className="text-sm text-[var(--kf-charcoal)]">{KF_SUPPORT_WHATSAPP_DISPLAY}</span>
          <span className="text-xs text-[var(--kf-muted)]">Opens WhatsApp with a pre-filled message</span>
        </a>
      </div>

      <p className="mt-6 text-sm text-[var(--kf-muted)]">
        For privacy-related requests, please see our{" "}
        <a href="/privacy" className="kf-link underline">
          Privacy Policy
        </a>{" "}
        for the same contact details and what to include in your message.
      </p>
    </KfLegalPageShell>
  );
}
