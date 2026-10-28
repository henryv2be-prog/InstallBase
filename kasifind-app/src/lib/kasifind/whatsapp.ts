export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("27")) return digits;
  if (digits.startsWith("0")) return `27${digits.slice(1)}`;
  return digits;
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phone);
  const text = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${text}`;
}

export function defaultEnquiryMessage(displayName: string, serviceHint?: string): string {
  const topic = serviceHint?.trim() ? ` about ${serviceHint.trim()}` : "";
  return `Hi, I found your listing on KasiFind${topic}. I'd like to enquire about your services — ${displayName}.`;
}
