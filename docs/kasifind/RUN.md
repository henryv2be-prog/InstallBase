# Running KasiFind locally

**Deploy branch:** `kasifind` (dedicated Railway service — do not deploy KasiFind from `cursor/installbase-platform-d4af`).

KasiFind lives at `/kasifind` and uses **`KASIFIND_DATABASE_URL`** only. InstallBase continues to use **`DATABASE_URL`**.

## Setup

1. Create a PostgreSQL database (local Docker or separate Railway plugin).
2. Add to `.env`:

   ```bash
   KASIFIND_DATABASE_URL="postgresql://..."
   AUTH_SECRET="..."   # or KASIFIND_SESSION_SECRET
   KASIFIND_ADMIN_EMAIL="you@example.com"
   KASIFIND_ADMIN_PASSWORD="your-strong-password"
   ```

3. Generate client, migrate, seed categories:

   ```bash
   npm run db:kasifind:generate
   npm run db:kasifind:deploy
   npm run db:kasifind:seed
   ```

4. Start the app: `npm run dev` → open `http://localhost:3000/kasifind`.

## Provider journey

1. Register at `/kasifind/account/register`.
2. Complete listing at `/kasifind/account/listing` (include services such as “steel gates”).
3. Publish — listing enters **PENDING** moderation.
4. Sign in as admin at `/kasifind/account/login` (user from `KASIFIND_ADMIN_*` env, created on seed/deploy), then moderate at `/kasifind/admin`.

## Public journey

1. Open `/kasifind`, allow location (or enter coordinates manually).
2. Search for a service; results sort by distance within the chosen radius.
3. Contact via WhatsApp or phone from the listing.

Do not point `KASIFIND_DATABASE_URL` at the InstallBase production database.
