# Official NSC question bank (DBE past papers)

Verified official questions are imported from version-controlled **batch JSON** files aligned to DBE question papers and memoranda—not generated or labeled as official without a paper reference.

## Layout

- `manifest.json` — lists batch file paths to import on deploy/seed
- `batches/{year}/{subject}-p{n}-{session}.json` — one import batch per paper/memo pair

Each batch defines:

- **Paper metadata** — subject, year, session, paper number, DBE portal URL (and optional direct PDF links)
- **Verification** — `draft` | `pending_review` | `verified` | `rejected`
- **Questions** — `sourceQuestionRef` (e.g. `1.1`), curriculum `topicSlug` / `subtopicSlug`, prompt, answers, memo-aligned explanation

Stable question identity: `sourceLabel` = `{batchSlug}:{sourceQuestionRef}`.

## Database

- `StudyQuestionImportBatch` — batch slug, verification status, notes
- `StudyNscPaper` — year/session/paper number, DBE URLs, link to batch
- `StudyQuestion` — `nscPaperId`, `importBatchId`, `verificationStatus`, paper/year/ref fields

Only questions with `verificationStatus: VERIFIED` appear in **Official NSC** quiz mode.

## Commands

```bash
# Curriculum + practice + all manifest batches
npm run db:seed-study

# Import only NSC batches (full manifest)
npm run db:import-nsc

# Import a single batch file (path relative to this folder)
npm run db:import-nsc -- batches/2022/mathematics-p1-november.json
```

Production start runs curriculum seed then manifest import (idempotent upserts).

## Curriculum coverage

Every subtopic in `curriculum-starter.ts` must appear in at least one manifest batch question (`subjectSlug` + `topicSlug` + `subtopicSlug`). CI runs `nscManifestCoverageGaps()` in `nsc-import.test.ts`.

## Adding papers at scale

1. Transcribe questions from the DBE memorandum into a new batch JSON (match existing batch shape; see `types.ts` / Zod schema).
2. Map each question to existing curriculum `topicSlug` and `subtopicSlug` for that subject.
3. Set verification to `pending_review` until a human checks prompt, marks, and acceptable answers against the memo; then set `verified` with `verifiedAt`.
4. Add the batch path to `manifest.json`.
5. Run `npm run db:import-nsc` locally or rely on deploy import.

Legacy hand-seeded `official-*` source labels are deactivated when the manifest import runs.

## Future: PDF ingestion

There is no automated PDF parser yet. Batches are structured JSON built from DBE PDFs/memoranda. A parser can emit the same batch schema for review before import.
