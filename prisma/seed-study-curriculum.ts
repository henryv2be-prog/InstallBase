import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { seedStudyCurriculum } from "../src/study/lib/seed-curriculum";
import { seedPracticeQuestions } from "../src/study/lib/seed-questions";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  console.log("📚 Seeding Grade 12 Study Coach curriculum (idempotent)…");
  await seedStudyCurriculum();
  await seedPracticeQuestions();
  const subjectCount = await prisma.studySubject.count();
  const questionCount = await prisma.studyQuestion.count();
  const topicCount = await prisma.studyTopic.count();
  const subtopicCount = await prisma.studySubtopic.count();
  console.log(
    `✅ Study curriculum seeded: ${subjectCount} subjects, ${topicCount} topics, ${subtopicCount} subtopics, ${questionCount} practice questions`,
  );
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
