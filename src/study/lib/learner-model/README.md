# Learner model & recommendations

**Product principle:** The calendar tells us *when*. The curriculum tells us *what exists*. The learner model tells us *what this student needs*. The recommendation engine decides *what they should do next*.

## Layers

| Layer | Location | Role |
|--------|-----------|------|
| **LearnerProfile** | `types.ts` + DB (`StudyLearner`, `StudyLearnerSubject`, exams) | Goals, identity, targets |
| **TopicMasteryState** | Built in `build-learning-state.ts` | Per-subtopic knowledge + behaviour signals |
| **LearningState** | Snapshot at `generatedAt` | Full input to the engine |
| **StudyRecommendation** | Output of `recommendation/score-candidates.ts` | Next action + reasons |

Persisted activity (already in schema):

- `StudyMastery` — mastery (recency-blended after quizzes), confidence, optional `selfConfidence`
- `StudyLearnerSubject.demonstratedMarkPct` — importance-weighted rollup from subtopic masteries
- `StudyQuestionAttempt` — every answer
- `StudyAssessmentSession` — study sessions (completed vs abandoned inferred)
- `StudyRecommendationLog` — shown / followed recommendations

## Recommendation engine

Deterministic Phase 2 rules in `recommendation/score-candidates.ts` (not in React).

Factors: mastery gap, exam urgency, target mark gap, topic importance, recent attempt scores, improvement trend, time since practice, self-confidence signal, curriculum prerequisites.

Actions: `PRACTICE_TOPIC`, `REVISIT_PREREQUISITE`, `TRY_HARDER_QUESTIONS`, `DO_PAST_PAPER`, etc.

## AI (Phase 4)

AI must sit **on top of** `LearningState` JSON — never invent marks, attempts, or exam dates. Use `getLearningStateForLearner()` as the grounded context.

## Tests

`npm test` includes `recommendation-engine.test.ts` — two learners with identical goals but different histories must get **different** next steps.
