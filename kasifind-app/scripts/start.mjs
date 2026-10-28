import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const url =
  process.env.KASIFIND_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("\n❌ Set KASIFIND_DATABASE_URL or DATABASE_URL.\n");
  process.exit(1);
}

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  console.error("\n❌ Invalid database URL.\n");
  process.exit(1);
}

if (process.env.NODE_ENV === "production" && url.includes("localhost")) {
  console.error("\n❌ Database URL points to localhost in production.\n");
  process.exit(1);
}

const secret = process.env.AUTH_SECRET?.trim() || process.env.KASIFIND_SESSION_SECRET?.trim();
if (!secret) {
  console.error("\n❌ AUTH_SECRET or KASIFIND_SESSION_SECRET is required.\n");
  process.exit(1);
}

const railwayDomain = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
if (!process.env.AUTH_URL?.trim() && railwayDomain) {
  process.env.AUTH_URL = `https://${railwayDomain}`;
  console.log(`→ AUTH_URL set to ${process.env.AUTH_URL}`);
}

const uploadDir = process.env.UPLOAD_DIR?.trim() || path.join(process.cwd(), "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

console.log("\n→ Running migrations (if needed)");
const migrate = spawnSync("node", ["scripts/migrate-deploy.mjs"], {
  stdio: "inherit",
  env: process.env,
});
if (migrate.status !== 0) process.exit(migrate.status ?? 1);

const port = process.env.PORT || "3000";
console.log(`\n→ Starting KasiFind on 0.0.0.0:${port}`);

const server = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  env: process.env,
});

server.on("exit", (code) => process.exit(code ?? 1));
process.on("SIGTERM", () => server.kill("SIGTERM"));
process.on("SIGINT", () => server.kill("SIGINT"));
