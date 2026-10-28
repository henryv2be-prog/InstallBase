# KasiFind on Railway (standalone service)

KasiFind deploys as its **own Railway service** with **Root Directory** `kasifind-app`. It does **not** run on the InstallBase production web service or under `/kasifind`.

See [STANDALONE.md](./STANDALONE.md) for architecture and local dev.

## Create the service (manual — requires your approval)

1. Railway project → **New service** → connect this repo.
2. **Settings → Source → Root Directory:** `kasifind-app`
3. **Branch:** `KasiFind` or `kasifind`
4. Add a **Postgres** plugin attached to this service only (do not share InstallBase production DB unless you intentionally migrate data).
5. Set variables on the **KasiFind web** service (see below).
6. Deploy. Public URL is `https://<kasifind-service>.up.railway.app/` (homepage at `/`).

Do **not** change InstallBase production service variables, domain, or root directory.

## Environment variables

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Reference from this service’s Postgres (`postgresql://…`) |
| `KASIFIND_DATABASE_URL` | No | Optional alias; if set, used instead of `DATABASE_URL` |
| `AUTH_SECRET` | Yes | 32+ random bytes (e.g. `openssl rand -base64 32`) |
| `AUTH_URL` | Yes | Public URL, e.g. `https://your-kasifind.up.railway.app` |
| `UPLOAD_DIR` | Recommended | e.g. `/data/uploads` with a Railway volume mounted |
| `KASIFIND_ADMIN_EMAIL` | For admin | Bootstrap admin on deploy seed |
| `KASIFIND_ADMIN_PASSWORD` | For admin | Rotate via env + redeploy |
| `KASIFIND_ADMIN_NAME` | No | Display name for bootstrap admin |

## Health and smoke checks

| URL | Expected |
|-----|----------|
| `/api/health` | `{"ok":true,...}` |
| `/` | KasiFind homepage |
| `/login` | Provider login |
| `/admin` | Moderation (admin session) |

## Deploy logs

If the container exits before `next start`, check deploy logs for:

| Message | Fix |
|---------|-----|
| `DATABASE_URL` missing / invalid | Use Postgres **reference** on the KasiFind service |
| `Missing AUTH_SECRET` | Set `AUTH_SECRET` |
| Migration failed | Postgres linked; URL reachable; run `npm run db:deploy` locally against same URL to debug |

## Moderation login

1. Set `KASIFIND_ADMIN_EMAIL` + `KASIFIND_ADMIN_PASSWORD` → redeploy.
2. Sign in at `/login`.
3. Open `/admin` to approve listings.
