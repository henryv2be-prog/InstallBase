"use client";

import { toPng } from "html-to-image";
import { buildProviderPerformanceReportFilename } from "@/lib/kasifind/provider-performance-report-filename";

export const PROVIDER_REPORT_WIDTH_PX = 1080;
export const PROVIDER_REPORT_HEIGHT_PX = 1350;

export async function captureProviderPerformanceReportPngDataUrl(node: HTMLElement): Promise<string> {
  return toPng(node, {
    cacheBust: true,
    pixelRatio: 1,
    width: PROVIDER_REPORT_WIDTH_PX,
    height: PROVIDER_REPORT_HEIGHT_PX,
    style: {
      transform: "scale(1)",
      transformOrigin: "top left",
    },
  });
}

export async function renderProviderPerformanceReportPngFile(
  node: HTMLElement,
  businessName: string
): Promise<File> {
  const dataUrl = await captureProviderPerformanceReportPngDataUrl(node);
  const blob = await fetch(dataUrl).then((r) => r.blob());
  return new File([blob], buildProviderPerformanceReportFilename(businessName), {
    type: "image/png",
  });
}

export function downloadProviderPerformanceReportFile(file: File): void {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.download = file.name;
  link.href = url;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export async function downloadProviderPerformanceReportPng(
  node: HTMLElement,
  businessName: string
): Promise<void> {
  const file = await renderProviderPerformanceReportPngFile(node, businessName);
  downloadProviderPerformanceReportFile(file);
}
