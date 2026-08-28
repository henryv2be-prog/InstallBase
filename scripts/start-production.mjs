import { spawn, spawnSync } from "node:child_process";
import { setupUploadVolume } from "./setup-volume.mjs";

const required = [
  { name: "DATABASE_URL", hint: "Reference Postgres: ${{Postgres.DATABASE_URL}}" },
  { name: "AUTH_SECRET", hint: "Generate with: openssl rand -base64 32" },
];

const missing = required.filter(({ name }) => !process.env[name]?.trim());
if (missing.length > 0) {
  console.error("\n❌ Missing required environment variables:\n");
  for (const { name, hint } of missing) {
    console.error(`  • ${name} — ${hint}`);
  }
  console.error("");
  process.exit(1);
}

console.log("Environment variables OK.");

console.log("\n→ Preparing upload storage");
setupUploadVolume();

console.log("\n→ Running database migrations");
const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PRISMA_HIDE_UPDATE_MESSAGE: "true",
  },
});

if (migrate.status !== 0) {
  console.error("\n❌ Database migration failed.\n");
  process.exit(migrate.status ?? 1);
}

console.log("Migrations complete.");

const port = process.env.PORT || "3000";
console.log(`\n→ Starting Next.js on 0.0.0.0:${port}`);

const server = spawn("npx", ["next", "start", "-H", "0.0.0.0", "-p", port], {
  stdio: "inherit",
  env: process.env,
});

server.on("exit", (code, signal) => {
  if (signal) {
    console.error(`Next.js stopped by signal: ${signal}`);
    process.exit(1);
  }
  process.exit(code ?? 1);
});

process.on("SIGTERM", () => server.kill("SIGTERM"));
process.on("SIGINT", () => server.kill("SIGINT"));
