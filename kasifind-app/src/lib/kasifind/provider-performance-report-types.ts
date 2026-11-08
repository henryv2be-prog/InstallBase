export type ProviderReportListingRow = {
  id: string;
  displayName: string;
  status: string;
  moderationStatus: string;
  phone: string;
  whatsapp: string | null;
};

export type ProviderPerformanceReportMetrics = {
  listingId: string;
  businessName: string;
  periodLabel: string;
  impressions: number;
  profileViews: number;
  contactClicks: number;
  directionsClicks: number;
  averageRating: number | null;
  reviewCount: number;
  trackingNotes: string[];
};
