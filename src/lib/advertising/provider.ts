import type { AdCreative, AdFetchOptions } from "./types";

/** Provider abstraction — swap internal / Google / other without changing UI. */
export interface AdvertisingProvider {
  readonly name: string;
  getAds(options: AdFetchOptions): Promise<AdCreative[]>;
}
