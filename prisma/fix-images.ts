import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { BROKEN_IMAGE_REPLACEMENTS } from "../src/lib/constants";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  let updated = 0;

  for (const [oldUrl, newUrl] of Object.entries(BROKEN_IMAGE_REPLACEMENTS)) {
    const postMedia = await prisma.postMedia.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    });
    const projectMedia = await prisma.projectMedia.updateMany({
      where: { url: oldUrl },
      data: { url: newUrl },
    });
    updated += postMedia.count + projectMedia.count;
    if (postMedia.count + projectMedia.count > 0) {
      console.log(`Replaced ${postMedia.count + projectMedia.count} × ${oldUrl.split("/photo-")[1]?.slice(0, 20)}…`);
    }
  }

  console.log(`✅ Fixed ${updated} image URL(s) in the database.`);
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
