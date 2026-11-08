import { kfDateKeyInSast } from "@/lib/kasifind/format-datetime";

export function buildProviderPerformanceReportFilename(businessName: string, now = new Date()): string {
  const safeName = businessName
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_")
    .slice(0, 48) || "Business";
  const dateKey = kfDateKeyInSast(now);
  return `KasiFind_Report_${safeName}_${dateKey}.png`;
}
