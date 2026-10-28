# KasiFind on Railway — troubleshooting

## “Application failed to respond” / “This page couldn’t load” (ERROR 1308169018)

The **build can succeed** while the **web process never stays up**. Railway then shows a generic server error on **any** URL (new domain or old).

### 1. Read **Deploy logs** (runtime)

Web service → **Deployments** → latest → **View logs** (scroll to the **end**).

Look for a line starting with **`❌`**. Common cases:

| Message | Fix |
|---------|-----|
| `DATABASE_URL is not set` / `invalid` | On the **web** service, variable **`DATABASE_URL`** = reference Postgres → `DATABASE_URL` (must start with `postgresql://`) |
| `DATABASE_URL points to localhost` | Delete manual localhost values; use Postgres **reference** |
| `Missing AUTH_SECRET` | Add **`AUTH_SECRET`** (random 32+ chars) on web service |
| `Database migration failed` | Postgres in same project; web service linked; redeploy after fixing URL |
| `KasiFind database migration failed` | Set **`KASIFIND_DATABASE_URL`** (reference second Postgres or same DB for testing) |

If you **never** see `→ Starting Next.js on 0.0.0.0:...`, the app exited before the server started.

### 2. Variables on the **web** service (not only Postgres)

| Variable | Value |
|----------|--------|
| `DATABASE_URL` | Reference from Postgres plugin |
| `KASIFIND_DATABASE_URL` | Reference from Postgres (KasiFind DB) |
| `AUTH_SECRET` | Strong secret |
| `AUTH_TRUST_HOST` | `true` |
| `AUTH_URL` | `https://<your-railway-domain>` |
| `NEXTAUTH_URL` | Same as `AUTH_URL` |

Branch: **`kasifind`**.

### 3. When it works

- `https://<domain>/api/health` → `{"ok":true,...}`
- `https://<domain>/kasifind` → KasiFind home

### 4. Postgres ↔ web link

In the project canvas, use **Connect** from Postgres to the web service (or shared variable references). Generating a new public URL does **not** fix a crashed container.
