# Running KasiFind locally

KasiFind is a **standalone Next.js app** in `kasifind-app/`. It does not run under InstallBase’s `/kasifind` routes.

**Deploy branch:** `KasiFind` / `kasifind` (dedicated Railway service — see [RAILWAY.md](./RAILWAY.md)).

## Setup

```bash
cd kasifind-app
cp .env.example .env
npm install
npm run db:deploy
npm run db:seed   # categories + optional admin bootstrap
npm run dev
```

Open `http://localhost:3000/`.

Use **`DATABASE_URL`** (or **`KASIFIND_DATABASE_URL`**) for a Postgres instance used **only by KasiFind**. Do not point it at InstallBase production monitoring data.

## Provider journey

1. Register at `/register`.
2. Complete listing at `/account/listing`.
3. Publish — listing enters **PENDING** moderation.
4. Admin: sign in at `/login` (bootstrap user from `KASIFIND_ADMIN_*` env on seed/deploy), then `/admin`.

## Public journey

1. Open `/`, allow location (or enter coordinates manually).
2. Search; results sort by distance within the chosen radius.
3. Contact via WhatsApp or phone from `/providers/[id]`.

## Commands (from `kasifind-app/`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` | Production build |
| `npm run start` | Migrations + Next.js (production) |
| `npm test` | Geo, WhatsApp, isolation boundary tests |
| `npm run db:deploy` | Apply Prisma migrations |
| `npm run db:seed` | Seed categories / admin bootstrap |
