# Generated practice (parametric)

Deterministic maths generators produce **validated** multiple-choice questions stored as `GENERATED_PRACTICE`.

- Never labelled or imported as official NSC content.
- Upserted by unique `sourceLabel` (`gen-<generatorId>-<slot>`) on seed — idempotent deploys.
- Expand by adding generators to `registry.ts` only when answers are independently verifiable.

Seed entry point: `seedGeneratedPracticeQuestions()` from `seedAllStudyQuestions()`.
