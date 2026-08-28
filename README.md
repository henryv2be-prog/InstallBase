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
