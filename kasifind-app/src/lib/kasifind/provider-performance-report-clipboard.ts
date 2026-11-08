"use client";

/** Copy report PNG to clipboard for pasting into WhatsApp (desktop Chrome, some mobile). */
export async function tryCopyProviderReportPngToClipboard(file: File): Promise<boolean> {
  if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
    return false;
  }
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [file.type]: file,
      }),
    ]);
    return true;
  } catch {
    return false;
  }
}
