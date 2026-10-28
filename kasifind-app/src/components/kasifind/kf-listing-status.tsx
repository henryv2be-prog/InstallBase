import { CheckCircle2, Clock, FileEdit, XCircle } from "lucide-react";

type ListingStatusInput = {
  status: string;
  moderationStatus: string;
};

export function listingStatusSummary(listing: ListingStatusInput): {
  label: string;
  detail: string;
} {
  if (listing.status === "DRAFT") {
    return {
      label: "Draft",
      detail: "Finish your listing and publish when you are ready.",
    };
  }
  if (listing.moderationStatus === "PENDING") {
    return {
      label: "In review",
      detail: "Usually approved within 1–2 business days.",
    };
  }
  if (listing.moderationStatus === "APPROVED") {
    return {
      label: "Live in search",
      detail: "Customers nearby can find and contact you.",
    };
  }
  if (listing.moderationStatus === "REJECTED") {
    return {
      label: "Needs changes",
      detail: "Update your listing and publish again.",
    };
  }
  if (listing.status === "DISABLED") {
    return {
      label: "Hidden",
      detail: "Contact support if you think this is a mistake.",
    };
  }
  return { label: "Listing", detail: "Manage your details below." };
}

export function KfListingStatusChip({ listing }: { listing: ListingStatusInput }) {
  const { label } = listingStatusSummary(listing);
  const Icon =
    listing.status === "DRAFT"
      ? FileEdit
      : listing.moderationStatus === "PENDING"
        ? Clock
        : listing.moderationStatus === "APPROVED"
          ? CheckCircle2
          : listing.moderationStatus === "REJECTED"
            ? XCircle
            : Clock;

  return (
    <span className="kf-status-chip">
      <Icon className="h-3.5 w-3.5" aria-hidden />
      {label}
    </span>
  );
}
