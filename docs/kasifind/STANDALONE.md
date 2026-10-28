# KasiFind standalone application

KasiFind is **not** served under InstallBase anymore. It lives in **`kasifind-app/`** as its own Next.js application.

## Why it was embedded before

The first MVP added routes under `src/app/kasifind/*` inside the InstallBase monolith, sharing one `npm run start`, InstallBase migrations, root layout providers, and one Railway service — hence `https://installbase-production…/kasifind`.

## New structure

```
kasifind-app/
  package.json          # KasiFind-only dependencies
  railway.toml          # Deploy this directory as Railway root
  prisma/               # Kf* models only
  scripts/start.mjs     # KasiFind migrations + Next.js (no InstallBase)
  src/app/
    page.tsx            # /
    login/ register/ account/listing/ admin/
    providers/[id]/
    api/health|search|categories|upload
```

## Railway (separate service — manual step)

1. **New service** in the same or new project — do **not** reuse InstallBase production web service.
2. **Settings → Source → Root Directory:** `kasifind-app`
3. **Branch:** `KasiFind` or `kasifind`
4. **Variables:** see `kasifind-app/.env.example` (`DATABASE_URL`, `AUTH_SECRET`, admin bootstrap, optional volume for `UPLOAD_DIR`)
5. **Postgres:** dedicated plugin for this service only.
6. Deploy → public URL is **`https://<kasifind-service>.up.railway.app/`** (no `/kasifind` prefix).

InstallBase production service, domain, and variables are **unchanged**.

## Local dev

```bash
cd kasifind-app
cp .env.example .env
npm install
npm run db:deploy
npm run dev
```

Open `http://localhost:3000/`.

## Monolith `/kasifind` routes

On the `KasiFind` branch, embedded `/kasifind` routes were removed from the repo root so the monolith no longer exposes KasiFind. Use **`kasifind-app`** exclusively.

## Environment variables

Documented in `kasifind-app/.env.example`. Summary:

- **`DATABASE_URL`** or **`KASIFIND_DATABASE_URL`** — Postgres for KasiFind only (`Kf*` tables).
- **`AUTH_SECRET`** — session signing (custom KasiFind session, not InstallBase NextAuth).
- **`AUTH_URL`** — public origin for cookies/redirects.
- **`UPLOAD_DIR`** — local or volume path for listing photos.
- **`KASIFIND_ADMIN_*`** — optional bootstrap admin on `db:seed` / production start seed.

## Build and start

From `kasifind-app/`:

```bash
npm install
npm run build    # prisma generate + next build
npm run start    # migrate deploy + seed + next start (see scripts/start.mjs)
npm test
```

Health: **`GET /api/health`**.

## Reuse from InstallBase

Copied into `kasifind-app/src/lib/shared/` (minimal): auth password validation, upload helpers. KasiFind auth is **`src/lib/kasifind/session.ts`** (HTTP-only cookie, path `/`). No `next-auth`, no InstallBase layout, no monitoring APIs.
