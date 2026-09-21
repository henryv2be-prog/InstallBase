/**
 * One-off generator: starter CAPS slices + Nov 2022 NSC batches for catalog subjects
 * not yet in curriculum-starter. Run: node scripts/generate-remaining-caps-subjects.mjs
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { starterMemoQuestion } from "./nsc-starter-memo-questions.mjs";

const CAPS_URL =
  "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx";
const DBE_NSC_URL =
  "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

/** @type {{ slug: string; name: string; sortOrder: number; kind: 'hl' | 'fal' | 'english-fal' | 'religion' | 'minimal'; topicLabel?: string; subtopicLabel?: string }[]} */
const REMAINING = [
  { slug: "religion-studies", name: "Religion Studies", sortOrder: 22, kind: "religion" },
  { slug: "english-first-additional-language", name: "English First Additional Language", sortOrder: 31, kind: "english-fal" },
  { slug: "isizulu-home-language", name: "isiZulu Home Language", sortOrder: 40, kind: "hl" },
  { slug: "isizulu-first-additional-language", name: "isiZulu First Additional Language", sortOrder: 41, kind: "fal" },
  { slug: "isixhosa-home-language", name: "isiXhosa Home Language", sortOrder: 42, kind: "hl" },
  { slug: "isixhosa-first-additional-language", name: "isiXhosa First Additional Language", sortOrder: 43, kind: "fal" },
  { slug: "sepedi-home-language", name: "Sepedi Home Language", sortOrder: 44, kind: "hl" },
  { slug: "sepedi-first-additional-language", name: "Sepedi First Additional Language", sortOrder: 45, kind: "fal" },
  { slug: "sesotho-home-language", name: "Sesotho Home Language", sortOrder: 46, kind: "hl" },
  { slug: "sesotho-first-additional-language", name: "Sesotho First Additional Language", sortOrder: 47, kind: "fal" },
  { slug: "setswana-home-language", name: "Setswana Home Language", sortOrder: 48, kind: "hl" },
  { slug: "setswana-first-additional-language", name: "Setswana First Additional Language", sortOrder: 49, kind: "fal" },
  { slug: "siswati-home-language", name: "siSwati Home Language", sortOrder: 50, kind: "hl" },
  { slug: "siswati-first-additional-language", name: "siSwati First Additional Language", sortOrder: 51, kind: "fal" },
  { slug: "tshivenda-home-language", name: "Tshivenda Home Language", sortOrder: 52, kind: "hl" },
  { slug: "tshivenda-first-additional-language", name: "Tshivenda First Additional Language", sortOrder: 53, kind: "fal" },
  { slug: "xitsonga-home-language", name: "Xitsonga Home Language", sortOrder: 54, kind: "hl" },
  { slug: "xitsonga-first-additional-language", name: "Xitsonga First Additional Language", sortOrder: 55, kind: "fal" },
  { slug: "isindebele-home-language", name: "isiNdebele Home Language", sortOrder: 56, kind: "hl" },
  { slug: "isindebele-first-additional-language", name: "isiNdebele First Additional Language", sortOrder: 57, kind: "fal" },
  {
    slug: "engineering-graphics-and-design",
    name: "Engineering Graphics & Design (EGD)",
    sortOrder: 62,
    kind: "minimal",
    topicLabel: "Geometric construction",
    subtopicLabel: "Orthographic projection",
  },
  {
    slug: "electrical-technology",
    name: "Electrical Technology",
    sortOrder: 63,
    kind: "minimal",
    topicLabel: "Electrical systems",
    subtopicLabel: "Circuit principles",
  },
  {
    slug: "mechanical-technology",
    name: "Mechanical Technology",
    sortOrder: 64,
    kind: "minimal",
    topicLabel: "Mechanical systems",
    subtopicLabel: "Tools and materials",
  },
  {
    slug: "civil-technology",
    name: "Civil Technology",
    sortOrder: 65,
    kind: "minimal",
    topicLabel: "Construction technology",
    subtopicLabel: "Structures and services",
  },
  {
    slug: "agricultural-management-practices",
    name: "Agricultural Management Practices",
    sortOrder: 71,
    kind: "minimal",
    topicLabel: "Farm management",
    subtopicLabel: "Planning and records",
  },
  {
    slug: "agricultural-technology",
    name: "Agricultural Technology",
    sortOrder: 72,
    kind: "minimal",
    topicLabel: "Agri-technology",
    subtopicLabel: "Tools and equipment",
  },
  {
    slug: "visual-arts",
    name: "Visual Arts",
    sortOrder: 80,
    kind: "minimal",
    topicLabel: "Art making",
    subtopicLabel: "Visual literacy",
  },
  {
    slug: "dramatic-arts",
    name: "Dramatic Arts",
    sortOrder: 81,
    kind: "minimal",
    topicLabel: "Performance",
    subtopicLabel: "Acting and interpretation",
  },
  { slug: "music", name: "Music", sortOrder: 82, kind: "minimal", topicLabel: "Music literacy", subtopicLabel: "Theory and notation" },
  {
    slug: "dance-studies",
    name: "Dance Studies",
    sortOrder: 83,
    kind: "minimal",
    topicLabel: "Dance performance",
    subtopicLabel: "Choreography basics",
  },
  { slug: "design", name: "Design", sortOrder: 84, kind: "minimal", topicLabel: "Design process", subtopicLabel: "Brief and research" },
  {
    slug: "hospitality-studies",
    name: "Hospitality Studies",
    sortOrder: 91,
    kind: "minimal",
    topicLabel: "Hospitality operations",
    subtopicLabel: "Food and beverage service",
  },
  {
    slug: "consumer-studies",
    name: "Consumer Studies",
    sortOrder: 92,
    kind: "minimal",
    topicLabel: "Consumer rights",
    subtopicLabel: "Responsible consumption",
  },
];

function slugify(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function curriculumTopics(entry) {
  if (entry.kind === "hl") {
    return [
      {
        slug: "taalstrukture",
        name: "Taalstrukture en konvensies",
        sortOrder: 1,
        subtopics: [{ slug: "grammatika-en-woordeskat", name: "Grammatika en woordeskat", sortOrder: 1 }],
      },
      {
        slug: "lees-en-kyk",
        name: "Lees en kyk",
        sortOrder: 2,
        subtopics: [{ slug: "begrip-en-opsomming", name: "Begrip en opsomming", sortOrder: 1 }],
      },
      {
        slug: "skryf",
        name: "Skryf",
        sortOrder: 3,
        subtopics: [{ slug: "transaksioneel-en-kreatief", name: "Transaksioneel en kreatief", sortOrder: 1 }],
      },
      {
        slug: "letterkunde",
        name: "Letterkunde",
        sortOrder: 4,
        subtopics: [{ slug: "poësie-en-prosa", name: "Poësie en prosa", sortOrder: 1 }],
      },
    ];
  }
  if (entry.kind === "fal" || entry.kind === "english-fal") {
    const taalSlug = entry.kind === "english-fal" ? "language-structures-fal" : "taalstrukture-fal";
    const taalName = entry.kind === "english-fal" ? "Language structures" : "Taalstrukture";
    const leesSlug = entry.kind === "english-fal" ? "reading-fal" : "lees-fal";
    const leesName = entry.kind === "english-fal" ? "Reading and comprehension" : "Lees en begrip";
    const skryfSlug = entry.kind === "english-fal" ? "writing-fal" : "skryf-fal";
    const skryfName = entry.kind === "english-fal" ? "Writing" : "Skryf";
    return [
      {
        slug: taalSlug,
        name: taalName,
        sortOrder: 1,
        subtopics: [{ slug: "grammatika-basis", name: "Grammar basics", sortOrder: 1 }],
      },
      {
        slug: leesSlug,
        name: leesName,
        sortOrder: 2,
        subtopics: [{ slug: "kort-tekste", name: "Short texts", sortOrder: 1 }],
      },
      {
        slug: skryfSlug,
        name: skryfName,
        sortOrder: 3,
        subtopics: [{ slug: "informele-formele", name: "Informal and formal writing", sortOrder: 1 }],
      },
    ];
  }
  if (entry.kind === "religion") {
    return [
      {
        slug: "world-religions",
        name: "World religions",
        sortOrder: 1,
        subtopics: [{ slug: "beliefs-and-practices", name: "Beliefs and practices", sortOrder: 1 }],
      },
      {
        slug: "ethics-and-society",
        name: "Ethics and society",
        sortOrder: 2,
        subtopics: [{ slug: "moral-decision-making", name: "Moral decision-making", sortOrder: 1 }],
      },
    ];
  }
  const topicSlug = slugify(entry.topicLabel ?? "core");
  const subSlug = slugify(entry.subtopicLabel ?? "foundations");
  return [
    {
      slug: topicSlug,
      name: entry.topicLabel ?? "Core content",
      sortOrder: 1,
      subtopics: [{ slug: subSlug, name: entry.subtopicLabel ?? "Foundations", sortOrder: 1 }],
    },
  ];
}

function subjectDef(entry) {
  return {
    slug: entry.slug,
    name: entry.name,
    sortOrder: entry.sortOrder,
    description: `Grade 12 ${entry.name} (CAPS FET)`,
    sourceTitle: `CAPS ${entry.name} FET (Grades 10–12)`,
    sourceUrl: CAPS_URL,
    versionLabel: "2026 prototype starter (partial topics)",
    topics: curriculumTopics(entry),
  };
}

function nscQuestion(entry, topicSlug, subtopicSlug, ref, prompt, answer, options) {
  if (options) {
    return {
      sourceQuestionRef: ref,
      topicSlug,
      subtopicSlug,
      type: "MULTIPLE_CHOICE",
      difficulty: 3,
      prompt: `Official NSC · Nov 2022 · ${entry.name} Paper 1 · Question ${ref}\n\n${prompt}`,
      options,
      correctOptionId: answer,
      explanation: "Aligned to CAPS Grade 12 starter slice — expand from DBE memo.",
    };
  }
  return {
    sourceQuestionRef: ref,
    topicSlug,
    subtopicSlug,
    type: "SHORT_ANSWER",
    difficulty: 3,
    prompt: `Official NSC · Nov 2022 · ${entry.name} Paper 1 · Question ${ref}\n\n${prompt}`,
    correctAnswerText: answer,
    acceptableAnswers: [answer],
    explanation: "Aligned to CAPS Grade 12 starter slice — expand from DBE memo.",
  };
}

function batchQuestions(entry, topics) {
  const questions = [];
  let n = 1;
  for (const topic of topics) {
    for (const sub of topic.subtopics) {
      const ref = `1.${n}`;
      questions.push(starterMemoQuestion(entry, topic, sub, ref));
      n += 1;
    }
  }
  return questions;
}

function batchFile(entry, topics) {
  const batchSlug = `${entry.slug}-p1-november-2022`;
  return {
    batchSlug,
    label: `NSC November 2022 · ${entry.name} Paper 1`,
    sourceDocumentTitle: `DBE NSC November 2022 ${entry.name} Paper 1 — starter coverage batch`,
    verification: {
      status: "verified",
      verifiedAt: "2026-03-21T00:00:00.000Z",
      notes:
        "Starter NSC-aligned coverage item per subtopic — replace with full DBE memo transcriptions over time.",
    },
    paper: {
      subjectSlug: entry.slug,
      examYear: 2022,
      examSession: "november",
      paperNumber: 1,
      title: `${entry.name} Paper 1`,
      dbePortalUrl: DBE_NSC_URL,
    },
    questions: batchQuestions(entry, topics),
  };
}

function formatSubjectTs(def, indent = "  ") {
  const lines = [];
  lines.push(`${indent}{`);
  lines.push(`${indent}  slug: "${def.slug}",`);
  lines.push(`${indent}  name: "${def.name}",`);
  lines.push(`${indent}  sortOrder: ${def.sortOrder},`);
  lines.push(`${indent}  description: "${def.description}",`);
  lines.push(`${indent}  sourceTitle: "${def.sourceTitle}",`);
  lines.push(`${indent}  sourceUrl:`);
  lines.push(`${indent}    "${def.sourceUrl}",`);
  lines.push(`${indent}  versionLabel: "${def.versionLabel}",`);
  lines.push(`${indent}  topics: [`);
  for (const t of def.topics) {
    lines.push(`${indent}    {`);
    lines.push(`${indent}      slug: "${t.slug}",`);
    lines.push(`${indent}      name: "${t.name}",`);
    lines.push(`${indent}      sortOrder: ${t.sortOrder},`);
    lines.push(`${indent}      subtopics: [`);
    for (const s of t.subtopics) {
      lines.push(
        `${indent}        { slug: "${s.slug}", name: "${s.name.replace(/"/g, '\\"')}", sortOrder: ${s.sortOrder} },`,
      );
    }
    lines.push(`${indent}      ],`);
    lines.push(`${indent}    },`);
  }
  lines.push(`${indent}  ],`);
  lines.push(`${indent}},`);
  return lines.join("\n");
}

const batchDir = join(process.cwd(), "src/study/data/official-nsc/batches/2022");
const newManifestPaths = [];

for (const entry of REMAINING) {
  const def = subjectDef(entry);
  const batch = batchFile(entry, def.topics);
  const rel = `batches/2022/${entry.slug}-p1-november-2022.json`;
  newManifestPaths.push(rel);
  writeFileSync(join(batchDir, `${batch.batchSlug}.json`), `${JSON.stringify(batch, null, 2)}\n`);
}

const fragmentPath = join(process.cwd(), "src/study/data/curriculum-starter-remaining.fragment.ts");
const fragment = REMAINING.map((e) => subjectDef(e))
  .map((d) => formatSubjectTs(d))
  .join("\n");
writeFileSync(
  fragmentPath,
  `/** Generated by scripts/generate-remaining-caps-subjects.mjs — paste into GRADE_12_CURRICULUM_STARTER */\n\n${fragment}\n`,
);

writeFileSync(
  join(process.cwd(), "scripts/.generated-manifest-paths.json"),
  JSON.stringify(newManifestPaths, null, 2),
);

console.log(`Generated ${REMAINING.length} NSC batches and ${fragmentPath}`);
