import { spawnSync } from "node:child_process";

const url =
  process.env.KASIFIND_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();

if (!url) {
  console.error("\n❌ KASIFIND_DATABASE_URL (or DATABASE_URL) is not set.\n");
  process.exit(1);
}

if (!url.startsWith("postgresql://") && !url.startsWith("postgres://")) {
  console.error("\n❌ Database URL must start with postgresql://\n");
  process.exit(1);
}

console.log("Running KasiFind database migrations...");

const migrate = spawnSync("npx", ["prisma", "migrate", "deploy"], {
  stdio: "inherit",
  shell: true,
  env: { ...process.env, PRISMA_HIDE_UPDATE_MESSAGE: "true" },
});

if (migrate.status !== 0) {
  console.error("\n❌ Migration failed.\n");
  process.exit(migrate.status ?? 1);
}

console.log("Seeding categories and admin bootstrap...");
const seed = spawnSync("npx", ["tsx", "prisma/seed.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (seed.status !== 0) {
  console.error("\n❌ Seed failed.\n");
  process.exit(seed.status ?? 1);
}

console.log("KasiFind database ready.");
