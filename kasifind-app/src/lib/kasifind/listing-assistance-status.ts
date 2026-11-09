import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";

export const ACTIVE_LISTING_ASSISTANCE_STATUSES = [
  "PENDING",
  "IN_PROGRESS",
] as const satisfies readonly KfListingAssistanceStatus[];

export function isActiveListingAssistanceStatus(status: KfListingAssistanceStatus): boolean {
  return (ACTIVE_LISTING_ASSISTANCE_STATUSES as readonly string[]).includes(status);
}

export function canProviderSubmitListingAssistance(
  latestStatus: KfListingAssistanceStatus | null
): boolean {
  if (!latestStatus) return true;
  return !isActiveListingAssistanceStatus(latestStatus);
}

export function providerVisibleAssistanceStatusLabel(status: KfListingAssistanceStatus): string {
  switch (status) {
    case "PENDING":
      return "Waiting for KasiFind";
    case "IN_PROGRESS":
      return "We’re helping with your listing";
    case "COMPLETED":
      return "Completed";
    case "DECLINED":
      return "Not taken forward";
    default:
      return status;
  }
}
