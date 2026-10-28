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

console.log("InstallBase migrations complete.");

const kasifindUrl = process.env.KASIFIND_DATABASE_URL?.trim();
if (kasifindUrl) {
  console.log("Running KasiFind database migrations...");
  const kfResult = spawnSync(
    "npx",
    ["prisma", "migrate", "deploy", "--config", "prisma/kasifind.config.ts"],
    {
      stdio: "inherit",
      shell: true,
      env: {
        ...process.env,
        PRISMA_HIDE_UPDATE_MESSAGE: "true",
      },
    }
  );
  if (kfResult.status !== 0) {
    console.error("\n❌ KasiFind database migration failed.\n");
    process.exit(kfResult.status ?? 1);
  }
  console.log("KasiFind migrations complete.");

  console.log("Ensuring KasiFind categories...");
  const kfSeed = spawnSync("npx", ["tsx", "prisma/kasifind/seed.ts"], {
    stdio: "inherit",
    shell: true,
    env: process.env,
  });
  if (kfSeed.status !== 0) {
    console.error("\n❌ KasiFind category seed failed.\n");
    process.exit(kfSeed.status ?? 1);
  }
} else {
  console.log("KASIFIND_DATABASE_URL not set — skipping KasiFind migrations.");
}

console.log("Ensuring active policy versions...");
const policySeed = spawnSync("npx", ["tsx", "prisma/seed-policies-cli.ts"], {
  stdio: "inherit",
  shell: true,
  env: process.env,
});

if (policySeed.status !== 0) {
  console.error("\n❌ Policy version seed failed.\n");
  process.exit(policySeed.status ?? 1);
}

console.log("Policy versions OK.");
