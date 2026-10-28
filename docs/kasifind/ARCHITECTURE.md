# KasiFind architecture

## Product boundary

KasiFind is a **standalone Next.js application** in `kasifind-app/`. It shares the Git repository with InstallBase but has its own entry point, build, deploy target, and database. InstallBase production is unchanged and does not serve KasiFind routes.

| Concern | InstallBase (repo root) | KasiFind (`kasifind-app/`) |
|--------|-------------------------|----------------------------|
| URL | `/`, `/feed`, … | `/`, `/providers/[id]`, `/login`, … |
| Database | `DATABASE_URL` → `prisma/schema.prisma` | `DATABASE_URL` or `KASIFIND_DATABASE_URL` → `kasifind-app/prisma/schema.prisma` |
| Prisma client | `@/lib/prisma` | `@/lib/kasifind/prisma` → `src/generated/prisma` |
| Auth | NextAuth | `kf_session` (HMAC cookie, path `/`) |
| Public browse | N/A | No login required |

## Deployment

- **Git branch:** `KasiFind` / `kasifind`
- **Railway:** new service, **Root Directory** `kasifind-app`, dedicated Postgres
- **InstallBase production** — separate service on `cursor/installbase-platform-d4af`; no KasiFind env vars or `/kasifind` routes

See [STANDALONE.md](./STANDALONE.md) and [RAILWAY.md](./RAILWAY.md).

## MVP user journey

1. Open `/` → optional browser geolocation.
2. Search service (e.g. “steel gates”) → API returns providers within radius, sorted by haversine distance.
3. Open `/providers/[id]` → photos, services, distance, **WhatsApp / call**.

## Search & location

- Initial radius **5 km**; user can expand (10, 25, 50 km).
- Haversine distance in SQL with bounding-box prefilter.
- Providers store **public** coordinates; `locationLabel` for human-readable area.
- User location is used only for the search request, not stored in a public profile.

## Reused patterns (not InstallBase runtime)

- Password validation and upload helpers in `kasifind-app/src/lib/shared/`
- KasiFind-specific UI in `kasifind-app/src/components/kasifind/`

## Not in MVP

- Payments, in-app chat, driving-distance routing, paid search/AI, company registration requirements.

## Commands

From `kasifind-app/` — see [RUN.md](./RUN.md).
