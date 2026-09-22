/**
 * Append NSC assessment checkpoints for curriculum subtopics missing batch coverage.
 * Run: node scripts/ensure-caps-nsc-checkpoints.mjs
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildCapsCheckpointBody } from "./caps-checkpoint-questions.mjs";

const root = process.cwd();
const nscRoot = join(root, "src/study/data/official-nsc");

async function loadCurriculum() {
  const mod = await import("../src/study/data/curriculum-starter.ts");
  return mod.GRADE_12_CURRICULUM_STARTER;
}

function curriculumKeys(starter) {
  const keys = [];
  for (const subject of starter) {
    for (const topic of subject.topics) {
      for (const sub of topic.subtopics) {
        keys.push({
          key: `${subject.slug}/${topic.slug}/${sub.slug}`,
          subjectSlug: subject.slug,
          subjectName: subject.name,
          topicSlug: topic.slug,
          topicName: topic.name,
          subtopicSlug: sub.slug,
          subtopicName: sub.name,
        });
      }
    }
  }
  return keys;
}

function loadManifest() {
  return JSON.parse(readFileSync(join(nscRoot, "manifest.json"), "utf8"));
}

function coveredKeys(manifest) {
  const covered = new Set();
  const batchBySubject = new Map();
  for (const rel of manifest.batches) {
    const path = join(nscRoot, rel);
    const batch = JSON.parse(readFileSync(path, "utf8"));
    const slug = batch.paper.subjectSlug;
    if (!batchBySubject.has(slug)) batchBySubject.set(slug, []);
    batchBySubject.get(slug).push({ rel, path, batch });
    for (const q of batch.questions) {
      covered.add(`${slug}/${q.topicSlug}/${q.subtopicSlug}`);
    }
  }
  return { covered, batchBySubject };
}

function pickBatch(batchBySubject, subjectSlug) {
  const list = batchBySubject.get(subjectSlug);
  if (!list?.length) return null;
  return list.sort((a, b) => b.batch.questions.length - a.batch.questions.length)[0];
}

function nextCapsRef(batch) {
  let max = 0;
  for (const q of batch.questions) {
    const m = /^CAPS\.(\d+)$/.exec(q.sourceQuestionRef);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `CAPS.${max + 1}`;
}

function formatQuestion(ctx, body, ref) {
  const header = `Official NSC · CAPS checkpoint · ${ctx.subjectName} · ${ref}\n\n${body.prompt}`;
  if (body.type === "SHORT_ANSWER") {
    return {
      sourceQuestionRef: ref,
      topicSlug: ctx.topicSlug,
      subtopicSlug: ctx.subtopicSlug,
      type: "SHORT_ANSWER",
      difficulty: body.difficulty ?? 3,
      prompt: header,
      correctAnswerText: body.correctAnswerText,
      acceptableAnswers: body.acceptableAnswers,
      explanation: body.explanation,
    };
  }
  return {
    sourceQuestionRef: ref,
    topicSlug: ctx.topicSlug,
    subtopicSlug: ctx.subtopicSlug,
    type: "MULTIPLE_CHOICE",
    difficulty: body.difficulty ?? 3,
    prompt: header,
    options: body.options,
    correctOptionId: body.correctOptionId,
    explanation: body.explanation,
  };
}

const starter = await loadCurriculum();
const manifest = loadManifest();
const { covered, batchBySubject } = coveredKeys(manifest);
const all = curriculumKeys(starter);
const gaps = all.filter((g) => !covered.has(g.key));

let appended = 0;
/** @type {Map<string, object>} */
const modifiedBatches = new Map();

for (const ctx of gaps) {
  const target = pickBatch(batchBySubject, ctx.subjectSlug);
  if (!target) {
    console.warn("No NSC batch for subject:", ctx.subjectSlug, ctx.key);
    continue;
  }
  let batch = modifiedBatches.get(target.path) ?? target.batch;
  const ref = nextCapsRef(batch);
  const body = buildCapsCheckpointBody(ctx);
  const question = formatQuestion(ctx, body, ref);
  batch.questions.push(question);
  modifiedBatches.set(target.path, batch);
  appended += 1;
}

for (const [path, batch] of modifiedBatches) {
  writeFileSync(path, `${JSON.stringify(batch, null, 2)}\n`);
}

console.log(
  `Appended ${appended} CAPS checkpoint questions across ${modifiedBatches.size} batch files (${gaps.length} gaps).`,
);
