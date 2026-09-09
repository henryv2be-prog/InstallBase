# InstallBase Advertising System

## Architecture

Advertising is modular and provider-based:

```
UI (AdSlot, AdCard, …)
  → InternalAdvertisingProvider (or future GoogleAdProvider)
    → Prisma (Advertiser, Campaign, Advertisement, AdInventory)
  → /api/ads/impression | /api/ads/click
    → analytics service (AdEvent + AdDailyStats)
```

Set `AD_PROVIDER=internal` (default). UI components never call the database directly.

## Database

| Table | Purpose |
|-------|---------|
| `Advertiser` | Company profile, contact info, future self-service link (`userId`) |
| `AdCampaign` | Campaign dates, budget, pricing model, status |
| `Advertisement` | Creative (title, media, CTA, placements, targeting JSON) |
| `AdInventory` | Sellable placement slots (name, format, dimensions, enabled) |
| `AdEvent` | Raw impression/click events (privacy-conscious, viewer key only) |
| `AdDailyStats` | Aggregated daily metrics per ad/placement |
| `AdSettings` | Global toggles and frequency caps |

## Admin workflow

1. Open **Admin → Advertising** (`/admin/ads`)
2. Create an **Advertiser** (manufacturer/distributor)
3. Create a **Campaign** (dates, pricing model, priority)
4. Create an **Advertisement** (type, placements, media URL, destination, targeting JSON)
5. Set status to **ACTIVE** and ensure campaign is **ACTIVE**
6. Use **Preview** before going live

## Placements

Placement keys live in `src/lib/advertising/placements.ts`. Enable/disable inventory in Admin → Inventory.

Integrated locations:

- Feed top + between posts (`/feed`)
- Explore community slot (`/discover`)
- Search results (`/search`)
- Jobs (`/jobs`)

## Targeting

Store JSON on each advertisement, e.g.:

```json
{
  "trades": ["CCTV", "Security"],
  "countries": ["South Africa"],
  "interests": ["Solar equipment"]
}
```

Matched against viewer profile specialties, country, and city at render time.

## Analytics

- Impressions recorded when `AdImpressionTracker` mounts (client)
- Clicks recorded before navigation
- Duplicate impressions/clicks within 30 minutes are deduplicated per viewer key
- Viewer key is a random session UUID — no PII stored

## Configuration

Environment overrides (optional):

```
ADS_ENABLED=true
MAX_FEED_ADS=3
MIN_POSTS_BETWEEN_ADS=4
MAX_PAGE_ADS=5
MOBILE_MAX_FEED_ADS=2
DESKTOP_MAX_FEED_ADS=3
AD_PROVIDER=internal
```

Database settings in Admin → Settings take effect when env vars are not set.

## Adding a new placement

1. Add key to `AD_PLACEMENTS` in `placements.ts`
2. Insert row in `AdInventory` (migration or admin seed)
3. Render `<AdSlot placement={AD_PLACEMENTS.YOUR_KEY} />` on the target page

## External provider integration

1. Implement `AdvertisingProvider` in `src/lib/advertising/`
2. Register in `getAdvertisingProvider()` (`internal-provider.ts`)
3. Set `AD_PROVIDER` and `provider` in `AdSettings`

UI components remain unchanged.

## Future work

- Advertiser self-service portal
- Payment processing (Stripe) for CPM/CPC/flat-rate
- Google Ad Manager / AdSense provider
- Event aggregation jobs for high-volume analytics
- Paid job listings and featured supplier packages
