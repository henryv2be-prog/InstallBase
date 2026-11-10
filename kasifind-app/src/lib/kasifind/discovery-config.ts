/** Progressive discovery ring outer edges (km from user). Rings are 0–R1, R1–R2, … */
export const DISCOVERY_RADIUS_RINGS_KM = [5, 15, 30, 50] as const;

/** Stop expanding once at least this many listings fall within the current outer ring. */
export const DISCOVERY_MIN_LISTINGS_BEFORE_STOP = 5;

export const DISCOVERY_LOCAL_RADIUS_KM = DISCOVERY_RADIUS_RINGS_KM[0];

export const DISCOVERY_MAX_RADIUS_KM =
  DISCOVERY_RADIUS_RINGS_KM[DISCOVERY_RADIUS_RINGS_KM.length - 1];

/** Nationwide browse — show more listings than geo-local search (still capped for UI performance). */
export const BROWSE_LISTING_LIMIT = 150;

/** Default cap for GPS / manual area searches (API may not exceed this). */
export const GEO_SEARCH_RESULT_LIMIT = 60;
