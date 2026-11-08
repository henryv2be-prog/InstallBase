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
import { tryCopyProviderReportPngToClipboard } from "@/lib/kasifind/provider-performance-report-clipboard";

export type ProviderReportWhatsAppShareResult =
  | {
      mode: "wa_listing";
      displayPhone: string;
      businessName: string;
      fileName: string;
      imageCopied: boolean;
    }
  | { mode: "native_share" }
  | { mode: "no_phone" };

function isLikelyMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

/** Deep-link to the listing's WhatsApp chat (no contact picker). */
function openWhatsAppToListing(url: string) {
  if (isLikelyMobileDevice()) {
    window.location.assign(url);
    return;
  }
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}

/**
 * When the listing has a number: open that chat via wa.me and prepare the image
 * (download + clipboard). We do not use the system share sheet here — that would
 * force a contact picker and bypass the listing number.
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

    downloadProviderPerformanceReportFile(file);
    const imageCopied = await tryCopyProviderReportPngToClipboard(file);
    const url = providerReportWhatsAppUrl(phone, shareText);
    openWhatsAppToListing(url);

    return {
      mode: "wa_listing",
      displayPhone,
      businessName: input.businessName,
      fileName: file.name,
      imageCopied,
    };
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
