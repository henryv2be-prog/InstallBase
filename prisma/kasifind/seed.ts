import { PrismaClient } from "../../src/generated/kasifind-prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { bootstrapKasiFindAdmin } from "../../src/lib/kasifind/bootstrap-admin";

const categories = [
  { slug: "metalwork-welding", name: "Metalwork and welding", sortOrder: 1 },
  { slug: "gates-security", name: "Gates and security", sortOrder: 2 },
  { slug: "aluminium-windows", name: "Aluminium windows and doors", sortOrder: 3 },
  { slug: "automotive", name: "Automotive repairs", sortOrder: 4 },
  { slug: "plumbing", name: "Plumbing", sortOrder: 5 },
  { slug: "electrical", name: "Electrical services", sortOrder: 6 },
  { slug: "construction", name: "Construction and building", sortOrder: 7 },
  { slug: "gas", name: "Gas supply and related services", sortOrder: 8 },
  { slug: "hair-beauty", name: "Hair, beauty and grooming", sortOrder: 9 },
  { slug: "cleaning", name: "Cleaning and household services", sortOrder: 10 },
  { slug: "food-shops", name: "Food and local shops", sortOrder: 11 },
  { slug: "other", name: "Other services", sortOrder: 99 },
];

async function main() {
  const url = process.env.KASIFIND_DATABASE_URL?.trim();
  if (!url) {
    console.error("Set KASIFIND_DATABASE_URL before seeding KasiFind.");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: url });
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  for (const cat of categories) {
    await prisma.kfCategory.upsert({
      where: { slug: cat.slug },
      create: cat,
      update: { name: cat.name, sortOrder: cat.sortOrder },
    });
  }

  console.info(`KasiFind: seeded ${categories.length} categories.`);

  await bootstrapKasiFindAdmin(prisma);

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
