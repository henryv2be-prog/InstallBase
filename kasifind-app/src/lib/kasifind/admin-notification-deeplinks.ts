export type PlatformEventMetadata = Record<string, unknown>;

export type AdminNotificationCopy = {
  title: string;
  body: string;
  deepLink: string;
};

const DEFAULT_ADMIN_LINK = "/admin";

export function buildAdminNotificationCopy(
  eventType: string,
  metadata?: PlatformEventMetadata | null
): AdminNotificationCopy {
  const m = metadata ?? {};
  const listingId = typeof m.listingId === "string" ? m.listingId : undefined;
  const userId = typeof m.userId === "string" ? m.userId : undefined;
  const requestId = typeof m.assistanceRequestId === "string" ? m.assistanceRequestId : undefined;
  const reportId = typeof m.reportId === "string" ? m.reportId : undefined;

  const listingName =
    typeof m.listingName === "string" && m.listingName.trim()
      ? m.listingName.trim()
      : "Listing";
  const shortListing = listingName.length > 48 ? `${listingName.slice(0, 45)}…` : listingName;

  switch (eventType) {
    case "user.registered":
    case "provider.registered":
      return {
        title: "KasiFind – New provider registered",
        body: "A new account was created.",
        deepLink: userId ? `/admin/users/${userId}` : "/admin/users",
      };
    case "provider.listing_assistance_requested":
    case "provider.listing_assistance_updated":
    case "provider.listing_assistance_completed":
      return {
        title: "KasiFind – Listing assistance",
        body: "A listing assistance request needs attention.",
        deepLink: requestId
          ? `/admin/listing-assistance/${requestId}`
          : "/admin/listing-assistance",
      };
    case "listing.created":
    case "listing.submitted_for_approval":
      return {
        title: "KasiFind – Listing awaiting approval",
        body: `${shortListing} needs review.`,
        deepLink: listingId ? `/admin/listings/${listingId}` : "/admin/listings",
      };
    case "listing.approved":
    case "listing.published":
      return {
        title: "KasiFind – Listing published",
        body: `${shortListing} is live.`,
        deepLink: listingId ? `/admin/listings/${listingId}` : "/admin/listings",
      };
    case "listing.rejected":
      return {
        title: "KasiFind – Listing rejected",
        body: `${shortListing} was rejected.`,
        deepLink: listingId ? `/admin/listings/${listingId}` : "/admin/reports",
      };
    case "customer.listing_reported":
      return {
        title: "KasiFind – Listing reported",
        body: "A listing was flagged for moderation.",
        deepLink: reportId ? "/admin/reports" : listingId ? `/admin/listings/${listingId}` : "/admin/reports",
      };
    case "technical.listing_publish_failed":
    case "technical.application_error":
    case "technical.api_failure":
    case "technical.background_job_failed":
      return {
        title: "KasiFind – Platform attention needed",
        body: "An important platform issue was recorded.",
        deepLink: DEFAULT_ADMIN_LINK,
      };
    default:
      return {
        title: "KasiFind – Platform activity",
        body: "Something changed on KasiFind.",
        deepLink: listingId
          ? `/admin/listings/${listingId}`
          : userId
            ? `/admin/users/${userId}`
            : DEFAULT_ADMIN_LINK,
      };
  }
}