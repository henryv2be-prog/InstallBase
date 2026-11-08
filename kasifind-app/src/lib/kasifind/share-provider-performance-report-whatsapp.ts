"use client";

import {
  buildProviderReportWhatsAppPrefill,
  formatListingPhoneForDisplay,
  isValidProviderWhatsAppPhone,
  providerReportWhatsAppUrl,
} from "@/lib/kasifind/provider-performance-report-whatsapp";
import {
  downloadProviderPerformanceReportPng,
  renderProviderPerformanceReportPngFile,
} from "@/lib/kasifind/export-provider-performance-report-png";

export type ProviderReportWhatsAppShareResult =
  | { mode: "wa_listing"; displayPhone: string }
  | { mode: "native_share" }
  | { mode: "no_phone" };

function openWhatsAppChat(url: string) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}

/**
 * When the listing has WhatsApp/phone, always open that provider's chat via wa.me.
 * The PNG is downloaded for attaching in that conversation (web cannot attach via URL).
 */
export async function shareProviderPerformanceReportWhatsApp(input: {
  node: HTMLElement;
  businessName: string;
  periodLabel: string;
  whatsAppPhone: string | null;
}): Promise<ProviderReportWhatsAppShareResult> {
  const shareText = buildProviderReportWhatsAppPrefill(input.businessName, input.periodLabel);

  if (isValidProviderWhatsAppPhone(input.whatsAppPhone)) {
    const phone = input.whatsAppPhone!.trim();
    const url = providerReportWhatsAppUrl(phone, shareText);
    openWhatsAppChat(url);
    await downloadProviderPerformanceReportPng(input.node, input.businessName);
    return { mode: "wa_listing", displayPhone: formatListingPhoneForDisplay(phone) };
  }

  const file = await renderProviderPerformanceReportPngFile(input.node, input.businessName);
  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      const payload: ShareData = { text: shareText, files: [file] };
      if (navigator.canShare?.(payload)) {
        await navigator.share(payload);
        return { mode: "native_share" };
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        throw err;
      }
    }
  }

  await downloadProviderPerformanceReportPng(input.node, input.businessName);
  return { mode: "no_phone" };
}
