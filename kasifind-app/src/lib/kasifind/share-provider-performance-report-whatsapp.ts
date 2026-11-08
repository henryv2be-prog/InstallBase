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
import { canShareProviderReportPngFile } from "@/lib/kasifind/provider-performance-report-share-flow";

export type ProviderReportWhatsAppShareResult =
  | {
      mode: "share_with_image";
      displayPhone: string;
      businessName: string;
    }
  | {
      mode: "wa_listing";
      displayPhone: string;
      imageCopied: boolean;
    }
  | { mode: "native_share" }
  | { mode: "no_phone" };

function openWhatsAppChat(url: string) {
  const link = document.createElement("a");
  link.href = url;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.click();
}

function shareTextForProvider(input: {
  businessName: string;
  periodLabel: string;
  displayPhone: string;
}): string {
  const body = buildProviderReportWhatsAppPrefill(input.businessName, input.periodLabel);
  return `${body}\n\n(To: ${input.businessName} · WhatsApp ${input.displayPhone})`;
}

/**
 * Mobile: one system share with the PNG attached (pick WhatsApp + provider in the sheet).
 * Desktop: download PNG, optional clipboard copy, open wa.me — attach or paste in chat.
 */
export async function shareProviderPerformanceReportWhatsApp(input: {
  node: HTMLElement;
  businessName: string;
  periodLabel: string;
  whatsAppPhone: string | null;
}): Promise<ProviderReportWhatsAppShareResult> {
  const file = await renderProviderPerformanceReportPngFile(input.node, input.businessName);

  if (isValidProviderWhatsAppPhone(input.whatsAppPhone)) {
    const phone = input.whatsAppPhone!.trim();
    const displayPhone = formatListingPhoneForDisplay(phone);
    const shareText = shareTextForProvider({
      businessName: input.businessName,
      periodLabel: input.periodLabel,
      displayPhone,
    });

    if (canShareProviderReportPngFile(file)) {
      try {
        await navigator.share({
          files: [file],
          text: shareText,
          title: `KasiFind report — ${input.businessName}`,
        });
        return {
          mode: "share_with_image",
          displayPhone,
          businessName: input.businessName,
        };
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          throw err;
        }
      }
    }

    downloadProviderPerformanceReportFile(file);
    const imageCopied = await tryCopyProviderReportPngToClipboard(file);
    const url = providerReportWhatsAppUrl(
      phone,
      buildProviderReportWhatsAppPrefill(input.businessName, input.periodLabel)
    );
    openWhatsAppChat(url);
    return { mode: "wa_listing", displayPhone, imageCopied };
  }

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

  downloadProviderPerformanceReportFile(file);
  return { mode: "no_phone" };
}
