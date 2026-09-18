import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";

/** Docker/npm ci may run before prisma/schema.prisma is copied — skip safely. */
if (!existsSync("prisma/schema.prisma")) {
  console.log("→ postinstall: prisma schema not present yet, skipping generate");
  process.exit(0);
}

const result = spawnSync("npx", ["prisma", "generate"], {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    PRISMA_HIDE_UPDATE_MESSAGE: "true",
  },
});

process.exit(result.status ?? 1);
