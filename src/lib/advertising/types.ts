import type { AdType, AdStatus, CampaignStatus, PricingModel } from "@/generated/prisma/client";
import type { AdPlacementKey } from "./placements";

export interface TargetingRules {
  professions?: string[];
  trades?: string[];
  countries?: string[];
  regions?: string[];
  skills?: string[];
  interests?: string[];
  equipmentCategories?: string[];
  companyTypes?: string[];
  userTypes?: string[];
}

export interface TargetingContext {
  userId?: string;
  specialties?: string[];
  country?: string;
  city?: string;
  experienceLevel?: string;
  companyType?: string;
  userType?: string;
}

export interface AdCreative {
  id: string;
  campaignId: string;
  advertiserId: string;
  advertiserName: string;
  advertiserLogoUrl: string | null;
  title: string;
  description: string | null;
  type: AdType;
  placements: string[];
  mediaUrl: string | null;
  mediaType: string | null;
  destinationUrl: string;
  ctaText: string | null;
  isInternalLink: boolean;
  sponsoredProductId: string | null;
  sponsoredPostId: string | null;
  priority: number;
  label: "Sponsored" | "Advertisement" | "Promoted";
}

export interface AdFetchOptions {
  placement: AdPlacementKey;
  limit?: number;
  device?: "mobile" | "desktop" | "tablet";
  targeting?: TargetingContext;
}

export interface AdSettingsSnapshot {
  adsEnabled: boolean;
  sponsoredEnabled: boolean;
  analyticsEnabled: boolean;
  maxFeedAds: number;
  minPostsBetweenAds: number;
  maxPageAds: number;
  mobileMaxFeedAds: number;
  desktopMaxFeedAds: number;
  defaultPriority: number;
  provider: string;
}

export type {
  AdType,
  AdStatus,
  CampaignStatus,
  PricingModel,
};
