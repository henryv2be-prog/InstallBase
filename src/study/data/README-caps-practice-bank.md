# CAPS practice bank

`caps-practice-bank.json` holds **six PRACTICE questions per curriculum subtopic** (~1 926 items). These are **not** official NSC examination questions; they supplement verified past-paper items and hand-authored STEM depth.

Regenerate after changing `scripts/caps-checkpoint-questions.mjs` or the curriculum map:

```bash
npm run generate:caps-practice
```

Seeding: `ensurePracticeQuestions()` upserts any missing rows from this file on practice/quiz routes and catalog ensure.
