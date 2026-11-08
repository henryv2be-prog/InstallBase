"use client";

import {
  buildProviderReportWhatsAppPrefill,
  formatListingPhoneForDisplay,
  isValidProviderWhatsAppPhone,
  providerReportWhatsAppUrl,
} from "@/lib/kasifind/provider-performance-report-whatsapp";
import {
  downloadProviderPerformanceReportFile,
  renderProviderPerformanceReportPngFile,
} from "@/lib/kasifind/export-provider-performance-report-png";
import {
  canShareProviderReportPngFile,
  PROVIDER_REPORT_WA_CHAT_OPEN_MS,
} from "@/lib/kasifind/provider-performance-report-share-flow";

export type ProviderReportWhatsAppShareResult =
  | { mode: "wa_listing_attached"; displayPhone: string }
  | { mode: "wa_listing"; displayPhone: string }
  | { mode: "native_share" }
  | { mode: "no_phone" };

function openWhatsAppChat(url: string) {
  const opened = window.open(url, "_blank", "noopener,noreferrer");
  if (!opened) {
    window.location.href = url;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Sends a provider report on WhatsApp using their listing number.
 *
 * When the browser can share files: opens that provider's chat via wa.me, then
 * triggers a file share so WhatsApp can pick up the PNG (mobile). Desktop still
 * downloads the PNG for manual attach — wa.me cannot include images.
 */
export async function shareProviderPerformanceReportWhatsApp(input: {
  node: HTMLElement;
  businessName: string;
  periodLabel: string;
  whatsAppPhone: string | null;
}): Promise<ProviderReportWhatsAppShareResult> {
  const file = await renderProviderPerformanceReportPngFile(input.node, input.businessName);
  const shareText = buildProviderReportWhatsAppPrefill(input.businessName, input.periodLabel);

  if (isValidProviderWhatsAppPhone(input.whatsAppPhone)) {
    const phone = input.whatsAppPhone!.trim();
    const displayPhone = formatListingPhoneForDisplay(phone);
    const url = providerReportWhatsAppUrl(phone, shareText);

    if (canShareProviderReportPngFile(file)) {
      openWhatsAppChat(url);
      await wait(PROVIDER_REPORT_WA_CHAT_OPEN_MS);
      try {
        await navigator.share({ files: [file] });
        return { mode: "wa_listing_attached", displayPhone };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw err;
        }
        downloadProviderPerformanceReportFile(file);
        return { mode: "wa_listing", displayPhone };
      }
    }

    downloadProviderPerformanceReportFile(file);
    openWhatsAppChat(url);
    return { mode: "wa_listing", displayPhone };
  }

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

  downloadProviderPerformanceReportFile(file);
  return { mode: "no_phone" };
}
