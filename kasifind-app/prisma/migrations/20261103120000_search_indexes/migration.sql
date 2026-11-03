-- Speed up published listing geo prefilter for KasiFind search.
CREATE INDEX IF NOT EXISTS "KfProviderListing_published_geo_idx"
  ON "KfProviderListing" ("latitude", "longitude")
  WHERE "status" = 'PUBLISHED' AND "moderationStatus" = 'APPROVED';

CREATE INDEX IF NOT EXISTS "KfProviderListing_published_status_idx"
  ON "KfProviderListing" ("status", "moderationStatus");

CREATE INDEX IF NOT EXISTS "KfProviderService_listingId_idx"
  ON "KfProviderService" ("listingId");
