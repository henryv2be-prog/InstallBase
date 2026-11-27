import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";

export function listingPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function isValidListingPhoneNumber(phone: string | null | undefined): boolean {
  return listingPhoneDigits((phone ?? "").trim()).length >= 9;
}

export function buildListingWhatsAppUrlFromWhatsappField(
  whatsapp: string | null | undefined,
  displayName: string,
  serviceHint?: string
): string | null {
  const raw = (whatsapp ?? "").trim();
  if (!isValidListingPhoneNumber(raw)) return null;
  return buildWhatsAppUrl(raw, defaultEnquiryMessage(displayName, serviceHint));
}

export function buildListingTelHref(phone: string | null | undefined): string | null {
  const raw = (phone ?? "").trim();
  if (!isValidListingPhoneNumber(raw)) return null;
  return `tel:${raw.replace(/\s/g, "")}`;
}

export function publicListingShowsContactBar(
  waUrl: string | null,
  callPhone: string,
  directionsUrl: string | null,
  listingId: string
): boolean {
  const canWhatsApp = Boolean(waUrl);
  const canCall = isValidListingPhoneNumber(callPhone);
  const canDirections = Boolean(directionsUrl);
  return canWhatsApp || canCall || canDirections || Boolean(listingId);
}