import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { importOfficialNscBatch } from "../src/study/lib/nsc-import/import-batch";
import { importOfficialNscFromManifest } from "../src/study/lib/nsc-import/import-from-manifest";
import { loadNscBatchFile } from "../src/study/lib/nsc-import/load-manifest";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const fileArg = process.argv[2];

  if (fileArg) {
    console.log(`Importing NSC batch file: ${fileArg}`);
    const raw = loadNscBatchFile(fileArg);
    const result = await importOfficialNscBatch(prisma, raw);
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  console.log("Importing all NSC batches from manifest.json…");
  const results = await importOfficialNscFromManifest(prisma);
  for (const result of results) {
    console.log(
      `✓ ${result.batchSlug}: ${result.questionsUpserted} questions (${result.verificationStatus})`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
