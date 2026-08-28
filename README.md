# InstallBase

**Where installers share what they build.**

InstallBase is a social network for technical installers — CCTV, access control, alarms, gate automation, networking, and low-voltage professionals.

## Features

- **Social Feed** — Modern Instagram-style feed with posts, likes, comments, and bookmarks
- **Brags** — Show off your best installations with brag points and Brag of the Week
- **Questions** — Social-style technical Q&A with helpful votes and solved markers
- **Projects** — Full installation portfolio pages
- **Profiles** — Professional installer profiles with reputation system
- **Discover** — Trending installations, installers, products, and leaderboard
- **Search** — Global search across installers, posts, products, and projects
- **Notifications & Messaging** — Real-time social interactions
- **Admin Dashboard** — User management, moderation queue, platform stats
- **Jobs** — Placeholder architecture for future marketplace

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS 4
- PostgreSQL + Prisma 7
- NextAuth.js v5
- Radix UI components

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL 16+

### Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit DATABASE_URL and AUTH_SECRET

# Run migrations
npm run db:migrate

# Seed demo data
npm run db:seed

# Start dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deploy to Railway

### 1. Create the project

1. Push this repo to GitHub (if not already).
2. In [Railway](https://railway.com), create a new project → **Deploy from GitHub repo** → select this repository.
3. Add a **PostgreSQL** plugin to the project.

### 2. Configure environment variables

On the **web service** (not Postgres), set:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (reference from Postgres plugin) |
| `AUTH_SECRET` | Random secret — run `openssl rand -base64 32` |
| `AUTH_URL` | `https://${{RAILWAY_PUBLIC_DOMAIN}}` |
| `AUTH_TRUST_HOST` | `true` |
| `PRISMA_HIDE_UPDATE_MESSAGE` | `true` |
| `UPLOAD_DIR` | `/data/uploads` (if you mounted a volume at `/data`) |

Link the Postgres plugin to the web service so `DATABASE_URL` resolves at runtime.

**About persistence:** Your PostgreSQL data is stored by the **Postgres plugin** (already persistent on Railway). The `/data` volume on the web service is for **uploaded images**, not the database — set `UPLOAD_DIR=/data/uploads` so post images survive redeploys.

### 3. Deploy

Railway reads `railway.toml` and will:

1. **Build** — `prisma generate` + `next build`
2. **Start** — run migrations, then `next start` on Railway's `$PORT`

If deploy fails, check deploy logs for `DATABASE_URL is not set` — that means Postgres isn't linked to the web service yet.

Generate a public domain under **Settings → Networking → Generate Domain**.

### 4. Seed demo data (optional, one time)

```bash
railway run -e ALLOW_SEED=true npm run db:seed
```

This wipes and re-seeds the database. Only run once on a fresh deploy.

### Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@installbase.io | InstallBase123! | User |
| admin@installbase.io | InstallBase123! | Admin |

## Project Structure

```
src/
├── app/              # Next.js App Router pages
│   ├── (app)/        # Authenticated app routes
│   ├── (auth)/       # Login/signup
│   └── api/          # API routes
├── components/       # React components
│   ├── ui/           # Design system
│   ├── feed/         # Post & feed components
│   ├── layout/       # Navigation & shell
│   └── ...
├── lib/              # Server logic, actions, queries
└── generated/        # Prisma client
prisma/
├── schema.prisma     # Database schema
└── seed.ts           # Demo data seeder
```

## License

Private — All rights reserved.
