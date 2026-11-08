export function canShareProviderReportPngFile(file: File): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    return navigator.canShare?.({ files: [file] }) ?? false;
  } catch {
    return false;
  }
}

/** Lets WhatsApp (mobile) come to foreground before the attach-image share sheet. */
export const PROVIDER_REPORT_WA_CHAT_OPEN_MS = 900;
