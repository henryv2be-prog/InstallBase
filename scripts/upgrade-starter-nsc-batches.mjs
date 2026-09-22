/**
 * Replace placeholder CAPS-focus MCQs in *-p1-november-2022.json batches with memo-style items.
 * Run: node scripts/upgrade-starter-nsc-batches.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { isPlaceholderPrompt, starterMemoQuestion } from "./nsc-starter-memo-questions.mjs";

const batchDir = join(process.cwd(), "src/study/data/official-nsc/batches/2022");
const files = readdirSync(batchDir).filter((f) => f.endsWith("-p1-november-2022.json"));

let upgradedQuestions = 0;
let filesTouched = 0;

for (const file of files) {
  const path = join(batchDir, file);
  const batch = JSON.parse(readFileSync(path, "utf8"));
  const subjectName = batch.paper?.title?.replace(/ Paper 1$/, "") ?? batch.label ?? file;
  const entry = { slug: batch.paper.subjectSlug, name: subjectName };

  let changed = false;
  const topicBySlug = new Map();

  for (const q of batch.questions) {
    if (!isPlaceholderPrompt(q.prompt)) continue;

    if (!topicBySlug.has(q.topicSlug)) {
      topicBySlug.set(q.topicSlug, { slug: q.topicSlug, name: q.topicSlug, subtopics: new Map() });
    }
    const topic = topicBySlug.get(q.topicSlug);
    if (!topic.subtopics.has(q.subtopicSlug)) {
      topic.subtopics.set(q.subtopicSlug, { slug: q.subtopicSlug, name: inferSubtopicName(q) });
    }
    const sub = topic.subtopics.get(q.subtopicSlug);
    const ref = q.sourceQuestionRef;
    const replacement = starterMemoQuestion(entry, topic, sub, ref);

    Object.assign(q, replacement);
    upgradedQuestions += 1;
    changed = true;
  }

  if (changed) {
    batch.verification = {
      ...batch.verification,
      notes:
        "Memo-style starter items per CAPS subtopic — expand with full DBE paper transcriptions over time.",
    };
    writeFileSync(path, `${JSON.stringify(batch, null, 2)}\n`);
    filesTouched += 1;
  }
}

console.log(`Upgraded ${upgradedQuestions} questions across ${filesTouched} batch files.`);

function inferSubtopicName(q) {
  const m = q.prompt.match(/CAPS focus for "([^"]+)"/);
  if (m) return m[1];
  return q.subtopicSlug.replace(/-/g, " ");
}
