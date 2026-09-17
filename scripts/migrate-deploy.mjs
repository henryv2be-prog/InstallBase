import { spawnSync } from "node:child_process";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.error("\n❌ DATABASE_URL is not set.\n");
  console.error("Railway setup:");
  console.error("  1. Add a PostgreSQL plugin to your project");
  console.error("  2. Open your web service → Variables → New Variable");
  console.error("  3. Name: DATABASE_URL");
  console.error("  4. Value: ${{Postgres.DATABASE_URL}} (use variable reference)\n");
  process.exit(1);
}

// validate-env.mjs already checks AUTH_SECRET; keep migrate guard for direct db:deploy runs.

console.log("Running database migrations...");

const result = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PRISMA_HIDE_UPDATE_MESSAGE: "true",
  },
});

if (result.status !== 0) {
  console.error("\n❌ Database migration failed.\n");
  process.exit(result.status ?? 1);
}

console.log("Migrations complete.");
