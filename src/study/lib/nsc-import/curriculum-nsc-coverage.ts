import { readFileSync } from "node:fs";
import { join } from "node:path";
import { GRADE_12_CURRICULUM_STARTER } from "@/study/data/curriculum-starter";
import { loadNscImportManifest, OFFICIAL_NSC_DATA_DIR } from "@/study/lib/nsc-import/load-manifest";
import { nscImportBatchSchema } from "@/study/lib/nsc-import/types";

export function curriculumSubtopicKeys(): string[] {
  const keys: string[] = [];
  for (const subject of GRADE_12_CURRICULUM_STARTER) {
    for (const topic of subject.topics) {
      for (const subtopic of topic.subtopics) {
        keys.push(`${subject.slug}/${topic.slug}/${subtopic.slug}`);
      }
    }
  }
  return keys;
}

/** Subtopics with at least one question in manifest batch JSON (by slug mapping). */
export function nscManifestCoveredSubtopicKeys(): Set<string> {
  const manifest = loadNscImportManifest();
  const covered = new Set<string>();

  for (const relativePath of manifest.batches) {
    const raw = JSON.parse(readFileSync(join(OFFICIAL_NSC_DATA_DIR, relativePath), "utf8"));
    const batch = nscImportBatchSchema.parse(raw);
    const subjectSlug = batch.paper.subjectSlug;
    for (const q of batch.questions) {
      covered.add(`${subjectSlug}/${q.topicSlug}/${q.subtopicSlug}`);
    }
  }

  return covered;
}

export function nscManifestCoverageGaps(): string[] {
  const covered = nscManifestCoveredSubtopicKeys();
  return curriculumSubtopicKeys().filter((key) => !covered.has(key));
}
