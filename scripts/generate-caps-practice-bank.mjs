/**
 * Build src/study/data/caps-practice-bank.json — CAPS practice depth (6 items / subtopic).
 * Run: node scripts/generate-caps-practice-bank.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  buildCapsPracticeDepthSet,
  CAPS_PRACTICE_DEPTH_PER_SUBTOPIC,
} from "./caps-checkpoint-questions.mjs";

const root = process.cwd();
const outPath = join(root, "src/study/data/caps-practice-bank.json");

async function loadCurriculumSubjects() {
  const mod = await import("../src/study/data/curriculum-starter.ts");
  return mod.GRADE_12_CURRICULUM_STARTER;
}

function formatPrompt(ctx, body, index) {
  const header = `Practice · CAPS · ${ctx.subjectName} · ${ctx.subtopicName} · ${index}/${CAPS_PRACTICE_DEPTH_PER_SUBTOPIC}\n\n`;
  return `${header}${body.prompt}`;
}

function bodyToSeed(ctx, body, index) {
  const seedKey = `caps-practice.${ctx.subjectSlug}.${ctx.topicSlug}.${ctx.subtopicSlug}.${String(index).padStart(2, "0")}`;
  const base = {
    seedKey,
    subjectSlug: ctx.subjectSlug,
    topicSlug: ctx.topicSlug,
    subtopicSlug: ctx.subtopicSlug,
    difficulty: body.difficulty ?? 3,
    prompt: formatPrompt(ctx, body, index),
    explanation: body.explanation ?? "",
  };

  if (body.type === "SHORT_ANSWER") {
    return {
      ...base,
      type: "SHORT_ANSWER",
      options: [{ id: "n/a", text: "Short answer" }],
      correctOptionId: "n/a",
      correctAnswerText: body.correctAnswerText ?? "",
      acceptableAnswers: body.acceptableAnswers ?? [body.correctAnswerText ?? ""],
    };
  }

  return {
    ...base,
    type: "MULTIPLE_CHOICE",
    options: body.options,
    correctOptionId: body.correctOptionId,
  };
}

const starter = await loadCurriculumSubjects();
const questions = [];

for (const subject of starter) {
  for (const topic of subject.topics) {
    for (const sub of topic.subtopics) {
      const ctx = {
        subjectSlug: subject.slug,
        subjectName: subject.name,
        topicSlug: topic.slug,
        topicName: topic.name,
        subtopicSlug: sub.slug,
        subtopicName: sub.name,
      };
      const bodies = buildCapsPracticeDepthSet(ctx);
      bodies.forEach((body, i) => {
        questions.push(bodyToSeed(ctx, body, i + 1));
      });
    }
  }
}

const payload = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  questionsPerSubtopic: CAPS_PRACTICE_DEPTH_PER_SUBTOPIC,
  questions,
};

writeFileSync(outPath, `${JSON.stringify(payload)}\n`);
console.log(`Wrote ${questions.length} practice questions to ${outPath}`);
