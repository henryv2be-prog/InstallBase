import { buildWhatsAppUrl } from "@/lib/kasifind/whatsapp";

export const KF_SUPPORT_EMAIL = "henry@dsiprojects.co.za";
export const KF_SUPPORT_WHATSAPP_DISPLAY = "067 395 5715";
/** National format for wa.me (27 + number without leading 0). */
export const KF_SUPPORT_WHATSAPP_PHONE = "0673955715";

export const KF_SUPPORT_WHATSAPP_PREFILL =
  "Hi KasiFind, I need some help with the platform.";

export function kfSupportMailtoUrl(subject?: string): string {
  const base = `mailto:${KF_SUPPORT_EMAIL}`;
  if (!subject?.trim()) return base;
  return `${base}?subject=${encodeURIComponent(subject.trim())}`;
}

export function kfSupportWhatsAppUrl(message = KF_SUPPORT_WHATSAPP_PREFILL): string {
  return buildWhatsAppUrl(KF_SUPPORT_WHATSAPP_PHONE, message);
}
