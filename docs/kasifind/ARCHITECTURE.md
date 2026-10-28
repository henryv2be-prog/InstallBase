# KasiFind architecture (Stage A)

## Product boundary

KasiFind is a **separate product** hosted in the same repository as InstallBase. InstallBase routes, Prisma schema, and `DATABASE_URL` data are **not modified** by KasiFind features.

| Concern | InstallBase | KasiFind |
|--------|-------------|----------|
| URL prefix | `/`, `/feed`, `/admin`, … | `/kasifind/*` |
| Database | `DATABASE_URL` → `prisma/schema.prisma` | `KASIFIND_DATABASE_URL` → `prisma/kasifind/schema.prisma` |
| Prisma client | `@/lib/prisma` | `@/lib/kasifind/prisma` |
| Auth session cookie | NextAuth | `kf_session` (HMAC, provider accounts only) |
| Public browse | N/A | No login required |

## Deployment

- **Git branch:** `kasifind` — point a **separate Railway service** at this branch (InstallBase stays on `cursor/installbase-platform-d4af`).
- **InstallBase production** — do not merge KasiFind into the InstallBase deploy branch; do not set `KASIFIND_DATABASE_URL` on InstallBase-only services.
- **KasiFind Railway** — provision a **separate PostgreSQL database** (second Postgres plugin). Set `KASIFIND_DATABASE_URL` on the KasiFind web service.
- Build generates **both** Prisma clients; InstallBase build does not query KasiFind tables unless `KASIFIND_DATABASE_URL` is set at runtime.

## MVP user journey

1. Open `/kasifind` → optional browser geolocation.
2. Search service (e.g. “steel gates”) → API returns providers within radius, sorted by haversine distance.
3. Open provider → photos, services, distance, **WhatsApp / call** (no in-app messaging).

## Search & location

- Initial radius **5 km**; user can expand (10, 25, 50 km).
- Haversine distance in SQL with bounding-box prefilter for efficiency.
- Providers store **public** coordinates (approximate); `locationLabel` for human-readable area.
- User location is used only for the search request (query params / POST body), never stored in a public profile.

## Reused from InstallBase

- Next.js App Router, Tailwind, shared UI primitives (`Button`, `Input`, `Card`).
- Password hashing patterns (`bcrypt`), validation style, upload directory conventions.
- Admin role pattern (server-side `ADMIN` check on KasiFind `User.role`).

## Not in MVP

- Payments, in-app chat, driving-distance routing, paid search/AI, company registration requirements.

## Commands

```bash
# KasiFind database (separate URL)
export KASIFIND_DATABASE_URL="postgresql://..."

npm run db:kasifind:generate
npm run db:kasifind:deploy
npm run db:kasifind:seed
```

See [RUN.md](./RUN.md) for the full local workflow.
