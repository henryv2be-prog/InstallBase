"use client";

import {
  buildProviderReportWhatsAppFallbackMessage,
  buildProviderReportWhatsAppPrefill,
  isValidProviderWhatsAppPhone,
  providerReportWhatsAppUrl,
} from "@/lib/kasifind/provider-performance-report-whatsapp";
import {
  downloadProviderPerformanceReportPng,
  renderProviderPerformanceReportPngFile,
} from "@/lib/kasifind/export-provider-performance-report-png";

export type ProviderReportWhatsAppShareResult =
  | { mode: "native_share" }
  | { mode: "wa_open"; note: string }
  | { mode: "no_phone" };

/**
 * Shares the report PNG with WhatsApp where the browser allows it (Web Share API + file).
 * Otherwise downloads the PNG and opens wa.me to the provider with a pre-filled message.
 */
export async function shareProviderPerformanceReportWhatsApp(input: {
  node: HTMLElement;
  businessName: string;
  periodLabel: string;
  whatsAppPhone: string | null;
}): Promise<ProviderReportWhatsAppShareResult> {
  const file = await renderProviderPerformanceReportPngFile(input.node, input.businessName);
  const shareText = buildProviderReportWhatsAppPrefill(input.businessName, input.periodLabel);

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

  if (!isValidProviderWhatsAppPhone(input.whatsAppPhone)) {
    await downloadProviderPerformanceReportPng(input.node, input.businessName);
    return { mode: "no_phone" };
  }

  await downloadProviderPerformanceReportPng(input.node, input.businessName);
  const message = buildProviderReportWhatsAppFallbackMessage(
    input.businessName,
    input.periodLabel
  );
  const url = providerReportWhatsAppUrl(input.whatsAppPhone!, message);
  window.open(url, "_blank", "noopener,noreferrer");

  return {
    mode: "wa_open",
    note:
      "Desktop browsers cannot attach files via WhatsApp links. The PNG was downloaded — attach it in the chat.",
  };
}
