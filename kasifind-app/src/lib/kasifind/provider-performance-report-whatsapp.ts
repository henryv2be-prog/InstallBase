import { buildWhatsAppUrl, normalizePhoneForWhatsApp } from "@/lib/kasifind/whatsapp";

export function buildProviderReportWhatsAppPrefill(
  businessName: string,
  periodLabel: string
): string {
  return `Hi! Here is your KasiFind performance snapshot for ${businessName} (${periodLabel}). Thank you for being part of KasiFind — every local business deserves to be found.`;
}

export function buildProviderReportWhatsAppFallbackMessage(
  businessName: string,
  periodLabel: string
): string {
  return `${buildProviderReportWhatsAppPrefill(businessName, periodLabel)}\n\nI've attached your report image — if it did not send automatically, please attach the PNG that was just downloaded.`;
}

export function providerReportWhatsAppUrl(phone: string, message: string): string {
  return buildWhatsAppUrl(phone, message);
}

export function isValidProviderWhatsAppPhone(phone: string | null | undefined): boolean {
  if (!phone?.trim()) return false;
  const digits = normalizePhoneForWhatsApp(phone);
  return digits.length >= 9;
}
