export function canShareProviderReportPngFile(file: File): boolean {
  if (typeof navigator === "undefined" || !navigator.share) return false;
  try {
    return navigator.canShare?.({ files: [file] }) ?? false;
  } catch {
    return false;
  }
}
