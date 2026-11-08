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
