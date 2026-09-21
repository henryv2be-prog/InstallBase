import { StudyContentSourceKind, type PrismaClient } from "@/generated/prisma/client";
import { importOfficialNscBatch } from "@/study/lib/nsc-import/import-batch";
import { loadNscBatchFile, loadNscImportManifest } from "@/study/lib/nsc-import/load-manifest";

async function deactivateLegacyOfficialQuestions(prisma: PrismaClient) {
  await prisma.studyQuestion.updateMany({
    where: {
      sourceKind: StudyContentSourceKind.OFFICIAL_PAST_PAPER,
      sourceLabel: { startsWith: "official-" },
    },
    data: { active: false },
  });
}

export async function importOfficialNscFromManifest(prisma: PrismaClient) {
  await deactivateLegacyOfficialQuestions(prisma);
  const manifest = loadNscImportManifest();
  const results = [];

  for (const relativePath of manifest.batches) {
    const raw = loadNscBatchFile(relativePath);
    results.push(await importOfficialNscBatch(prisma, raw));
  }

  return results;
}
