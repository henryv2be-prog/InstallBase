/**
 * NSC-style assessment checkpoints for CAPS subtopics (tracking, not teaching).
 */

/** @param {{ subjectSlug: string; subjectName: string; topicSlug: string; topicName: string; subtopicSlug: string; subtopicName: string }} ctx */
export function buildCapsCheckpointBody(ctx) {
  const key = `${ctx.subjectSlug}/${ctx.subtopicSlug}`;
  const topicKey = `${ctx.topicSlug}/${ctx.subtopicSlug}`;
  const fn = SPECIFIC[key] ?? SPECIFIC[topicKey];
  if (fn) return fn(ctx);
  return bySubject(ctx);
}

function bySubject(ctx) {
  const builders = {
    mathematics: mathCheckpoint,
    "physical-sciences": physCheckpoint,
    "life-sciences": lifeCheckpoint,
    accounting: accountingCheckpoint,
    "mathematical-literacy": mathLitCheckpoint,
  };
  const b = builders[ctx.subjectSlug];
  return b ? b(ctx) : appliedMcq(ctx);
}

function appliedMcq(ctx, extraPrompt = "") {
  const lead = extraPrompt || `Which outcome best matches NSC assessment of "${ctx.subtopicName}"?`;
  return mcq(
    `${lead}`,
    "a",
    [
      {
        id: "a",
        text: `Apply ${ctx.subtopicName.toLowerCase()} in extended, CAPS-aligned exam tasks`,
      },
      { id: "b", text: "Demonstrate only unrelated recall with no application" },
      { id: "c", text: "Skip this subtopic in Grade 12 NSC preparation" },
      { id: "d", text: "Use only content from earlier grades with no Grade 12 depth" },
    ],
    `CAPS ${ctx.subjectName}: ${ctx.topicName} · ${ctx.subtopicName} — assessed through applied exam-style work.`,
  );
}

function mcq(prompt, correctId, options, explanation, difficulty = 3) {
  return { type: "MULTIPLE_CHOICE", difficulty, prompt, options, correctOptionId: correctId, explanation };
}

function short(prompt, answer, explanation, acceptable) {
  return {
    type: "SHORT_ANSWER",
    difficulty: 3,
    prompt,
    correctAnswerText: answer,
    acceptableAnswers: acceptable ?? [answer],
    explanation,
  };
}

function mathCheckpoint(ctx) {
  const m = MATH[ctx.subtopicSlug];
  return m ? m(ctx) : appliedMcq(ctx);
}

function physCheckpoint(ctx) {
  const m = PHYS[ctx.subtopicSlug];
  return m ? m(ctx) : appliedMcq(ctx);
}

function lifeCheckpoint(ctx) {
  const m = LIFE[ctx.subtopicSlug];
  return m ? m(ctx) : appliedMcq(ctx);
}

function accountingCheckpoint(ctx) {
  const m = ACCOUNTING[ctx.subtopicSlug];
  return m ? m(ctx) : appliedMcq(ctx);
}

function mathLitCheckpoint(ctx) {
  return appliedMcq(ctx);
}

/** @type {Record<string, (ctx: object) => object>} */
const MATH = {
  "exponential-and-logarithmic": () =>
    short(
      "Solve for x: 2^x = 8",
      "3",
      "2^x = 8 → x = 3.",
      ["x=3", "3"],
    ),
  "rational-functions": () =>
    mcq(
      "For f(x) = (x + 1)/(x − 2), which value is NOT in the domain?",
      "b",
      [
        { id: "a", text: "x = 0" },
        { id: "b", text: "x = 2" },
        { id: "c", text: "x = −1" },
        { id: "d", text: "x = 3" },
      ],
      "Denominator x − 2 ≠ 0 → x ≠ 2.",
    ),
  "quadratic-sequences": () =>
    short(
      "Find the second difference of the sequence 4; 9; 16; 25; …",
      "2",
      "Terms are n²; second difference of quadratic pattern is constant (2 for n² sequence from standard form).",
      ["2", "second diff = 2"],
    ),
  "arithmetic-sequences": () =>
    short(
      "In an arithmetic sequence, T5 = 14 and d = 3. Find T1.",
      "2",
      "T1 = T5 − 4d = 14 − 12 = 2.",
      ["2", "T1=2"],
    ),
  "geometric-sequences": () =>
    short(
      "In a geometric sequence, T1 = 2 and r = 3. Find T4.",
      "54",
      "T4 = 2 × 3³ = 54.",
      ["54", "T4=54"],
    ),
  "sigma-notation": () =>
    short(
      "Evaluate: Σ(k=1 to 3) 2k",
      "12",
      "2+4+6 = 12.",
      ["12", "Σ=12"],
    ),
  "simple-and-compound-growth": () =>
    short(
      "R10 000 grows at 8% p.a. simple interest for 2 years. Find the total amount.",
      "11600",
      "I = 10000×0.08×2 = 1600 → A = 11600.",
      ["11600", "R11600", "11 600"],
    ),
  "annuities-and-loans": () =>
    mcq(
      "Which description matches a sinking fund payment?",
      "c",
      [
        { id: "a", text: "Single lump sum with no interest" },
        { id: "b", text: "Only simple interest on a current account" },
        { id: "c", text: "Regular payments to accumulate a future lump sum" },
        { id: "d", text: "Tax rebate on donations" },
      ],
      "Finance CAPS: annuities/sinking funds for loans and investments.",
    ),
  "nature-of-roots": () =>
    mcq(
      "For x² − 4x + k = 0 to have equal roots, k equals —",
      "b",
      [
        { id: "a", text: "0" },
        { id: "b", text: "4" },
        { id: "c", text: "8" },
        { id: "d", text: "−4" },
      ],
      "Equal roots → Δ = 0 → 16 − 4k = 0 → k = 4.",
    ),
  "straight-line": () =>
    short(
      "Find the gradient of the line through (2; 3) and (6; 11).",
      "2",
      "m = (11−3)/(6−2) = 2.",
      ["2", "m=2"],
    ),
  "circle-geometry": () =>
    short(
      "Write the centre of the circle x² + y² − 6x + 4y = 12 in the form (a; b).",
      "3,-2",
      "Complete the square: centre (3; −2).",
      ["(3;-2)", "3;-2", "x=3,y=-2"],
    ),
  "reductions-and-graphs": () =>
    mcq(
      "sin(180° − θ) equals —",
      "a",
      [
        { id: "a", text: "sin θ" },
        { id: "b", text: "−sin θ" },
        { id: "c", text: "cos θ" },
        { id: "d", text: "−cos θ" },
      ],
      "Reduction formula: sin(180° − θ) = sin θ.",
    ),
  "sine-cosine-area-rules": () =>
    short(
      "In ΔABC, a = 8 cm, b = 6 cm, C = 30°. Find side c (1 d.p.) using the cosine rule.",
      "4.4",
      "c² = 8² + 6² − 2(8)(6)cos30° → c ≈ 4.4 cm.",
      ["4.4", "c=4.4"],
    ),
  "trigonometry-in-3d": () =>
    mcq(
      "In 3D trig problems, the FIRST step is usually to —",
      "d",
      [
        { id: "a", text: "ignore the diagram" },
        { id: "b", text: "use only area rule without a right triangle" },
        { id: "c", text: "assume all angles are 90°" },
        { id: "d", text: "identify a right-angled triangle in the diagram" },
      ],
      "CAPS 3D trig: reduce to right triangles in the figure.",
    ),
  "proportion-and-similarity": () =>
    mcq(
      "If ΔABC ||| ΔDEF with AB:DE = 2:3, then area ratio Area(ABC):Area(DEF) is —",
      "c",
      [
        { id: "a", text: "2:3" },
        { id: "b", text: "3:2" },
        { id: "c", text: "4:9" },
        { id: "d", text: "8:27" },
      ],
      "Area ratio = (linear ratio)² → 4:9.",
    ),
  "circle-geometry-proofs": () =>
    mcq(
      "The angle subtended by a diameter at the circumference is —",
      "b",
      [
        { id: "a", text: "45°" },
        { id: "b", text: "90°" },
        { id: "c", text: "180°" },
        { id: "d", text: "60°" },
      ],
      "Euclidean geometry theorem: angle in a semicircle is 90°.",
    ),
  "regression-and-correlation": () =>
    mcq(
      "A correlation coefficient r close to −1 indicates —",
      "d",
      [
        { id: "a", text: "no linear relationship" },
        { id: "b", text: "weak positive correlation" },
        { id: "c", text: "causation" },
        { id: "d", text: "strong negative linear correlation" },
      ],
      "Statistics CAPS: interpret r and scatter plots.",
    ),
  "measures-of-dispersion": () =>
    short(
      "Data set: 2, 4, 4, 4, 6. Find the standard deviation (population, use σ formula).",
      "1.2",
      "Mean = 4; variance = 1.44; σ ≈ 1.2 (1 d.p.).",
      ["1.2", "1.20", "σ=1.2"],
    ),
  "counting-principles": () =>
    short(
      "How many 3-digit codes can be formed from digits 1–5 if repetition is allowed?",
      "125",
      "5 × 5 × 5 = 125.",
      ["125", "5^3"],
    ),
  "probability-rules": () =>
    mcq(
      "Events A and B are independent with P(A)=0.4 and P(B)=0.5. Find P(A and B).",
      "a",
      [
        { id: "a", text: "0.20" },
        { id: "b", text: "0.90" },
        { id: "c", text: "0.10" },
        { id: "d", text: "0.45" },
      ],
      "Independent: P(A∩B) = P(A)P(B) = 0.2.",
    ),
};

/** @type {Record<string, (ctx: object) => object>} */
const PHYS = {
  "work-energy-power": () =>
    short(
      "A 2 kg object is lifted 3 m vertically. Calculate the increase in gravitational potential energy (g = 10 m·s⁻²).",
      "60",
      "Ep = mgh = 2×10×3 = 60 J.",
      ["60 J", "60", "Ep=60"],
    ),
  "doppler-effect": () =>
    mcq(
      "When a sound source moves TOWARDS a stationary observer, the observed frequency —",
      "a",
      [
        { id: "a", text: "increases" },
        { id: "b", text: "decreases" },
        { id: "c", text: "is unchanged always" },
        { id: "d", text: "becomes zero" },
      ],
      "Doppler: approaching source → higher observed frequency.",
    ),
  "photoelectric-effect": () =>
    mcq(
      "Photoelectrons are emitted only when incident light —",
      "c",
      [
        { id: "a", text: "has any intensity regardless of frequency" },
        { id: "b", text: "is below the threshold frequency" },
        { id: "c", text: "has frequency above the threshold/work function" },
        { id: "d", text: "is always infrared" },
      ],
      "CAPS: photoelectric effect depends on frequency threshold.",
    ),
  "electromagnetic-induction": () =>
    mcq(
      "Lenz's law states that the induced current opposes —",
      "b",
      [
        { id: "a", text: "only the battery polarity" },
        { id: "b", text: "the change causing it" },
        { id: "c", text: "all magnetic fields everywhere" },
        { id: "d", text: "gravitational force" },
      ],
      "Electrodynamics CAPS: Lenz's law and flux change.",
    ),
  "acids-and-bases": () =>
    mcq(
      "A solution with pH = 3 is —",
      "a",
      [
        { id: "a", text: "acidic" },
        { id: "b", text: "neutral" },
        { id: "c", text: "basic" },
        { id: "d", text: "always a strong base" },
      ],
      "pH < 7 → acidic (CAPS acids and bases).",
    ),
  electrochemistry: () =>
    mcq(
      "In a galvanic cell, oxidation occurs at the —",
      "c",
      [
        { id: "a", text: "salt bridge only" },
        { id: "b", text: "cathode" },
        { id: "c", text: "anode" },
        { id: "d", text: "voltmeter" },
      ],
      "Electrochemical cells: anode = oxidation.",
    ),
  "organic-chemistry": () =>
    mcq(
      "The general formula for alkanes is —",
      "b",
      [
        { id: "a", text: "CnH2n" },
        { id: "b", text: "CnH2n+2" },
        { id: "c", text: "CnH2n−2" },
        { id: "d", text: "CnHn" },
      ],
      "Organic CAPS: alkane homologous series CnH2n+2.",
    ),
};

/** @type {Record<string, (ctx: object) => object>} */
const LIFE = {
  meiosis: () =>
    mcq(
      "The main purpose of meiosis is to produce cells with —",
      "d",
      [
        { id: "a", text: "double the chromosome number" },
        { id: "b", text: "identical copies for growth only" },
        { id: "c", text: "no genetic variation" },
        { id: "d", text: "half the chromosome number for gametes" },
      ],
      "Meiosis: reduction division for sexual reproduction.",
    ),
  "human-evolution": (ctx) =>
    appliedMcq(ctx, "Which evidence supports human evolution studies in NSC Life Sciences?"),
  "endocrine-system": () =>
    mcq(
      "Homeostasis in blood glucose is primarily regulated by —",
      "a",
      [
        { id: "a", text: "insulin and glucagon" },
        { id: "b", text: "only adrenaline" },
        { id: "c", text: "the skin only" },
        { id: "d", text: "digestive enzymes only" },
      ],
      "Endocrine control of glucose (CAPS).",
    ),
  "nervous-system": () =>
    mcq(
      "The gap between two neurons is called the —",
      "b",
      [
        { id: "a", text: "axon" },
        { id: "b", text: "synapse" },
        { id: "c", text: "dendrite" },
        { id: "d", text: "myelin sheath" },
      ],
      "Nervous system structure and impulse transmission.",
    ),
  "photosynthesis-and-respiration": () =>
    mcq(
      "The main product of the light reactions of photosynthesis used in the Calvin cycle is —",
      "c",
      [
        { id: "a", text: "CO₂" },
        { id: "b", text: "O₂ only with no energy carriers" },
        { id: "c", text: "ATP and NADPH" },
        { id: "d", text: "glucose immediately" },
      ],
      "CAPS: light-dependent reactions supply ATP/NADPH.",
    ),
  "animal-responses": (ctx) =>
    appliedMcq(ctx, "Tropisms and animal behaviour are typically assessed through —"),
  "human-activities-and-ecosystems": (ctx) =>
    appliedMcq(ctx, "Pollution and resource use in ecosystems are assessed by —"),
};

/** @type {Record<string, (ctx: object) => object>} */
const ACCOUNTING = {
  "company-legislation": () =>
    mcq(
      "The Companies Act primarily requires companies to —",
      "a",
      [
        { id: "a", text: "maintain proper records and present fair financial statements" },
        { id: "b", text: "avoid all external audits" },
        { id: "c", text: "ignore internal controls" },
        { id: "d", text: "publish no notes to financial statements" },
      ],
      "Accounting CAPS: company legislation and governance.",
    ),
  "inventory-valuation": () =>
    mcq(
      "Which method values inventory at the most recent purchase cost first on issue?",
      "c",
      [
        { id: "a", text: "Weighted average" },
        { id: "b", text: "Specific identification only" },
        { id: "c", text: "FIFO" },
        { id: "d", text: "Random allocation" },
      ],
      "Inventory systems: FIFO/weighted average (CAPS).",
    ),
  "cash-flow-statement": (ctx) =>
    appliedMcq(ctx, "The cash flow statement classifies cash flows into —"),
  "notes-to-financial-statements": (ctx) =>
    appliedMcq(ctx, "Notes to the financial statements mainly provide —"),
  "debtors-creditors-reconciliation": (ctx) =>
    appliedMcq(ctx, "Age analysis of debtors helps assess —"),
  "vat-calculations": () =>
    short(
      "VAT is 15%. Exclusive price R400. Find VAT amount.",
      "60",
      "VAT = 400 × 0.15 = R60.",
      ["60", "R60"],
    ),
  "production-cost-statements": (ctx) =>
    appliedMcq(ctx, "Direct material + direct labour + factory overheads relate to —"),
  "code-of-ethics": () =>
    mcq(
      "Professional accountants should prioritise —",
      "b",
      [
        { id: "a", text: "personal gain over truth" },
        { id: "b", text: "integrity and transparency" },
        { id: "c", text: "hiding errors from auditors" },
        { id: "d", text: "conflicts of interest without disclosure" },
      ],
      "Ethics and internal control (CAPS).",
    ),
};

/** @type {Record<string, (ctx: object) => object>} */
const SPECIFIC = {};

export const CAPS_PRACTICE_DEPTH_PER_SUBTOPIC = 6;

function hashSlug(s) {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** @param {object} ctx @param {number} slot 2..6 */
function buildPracticeVariant(ctx, slot) {
  const h = hashSlug(`${ctx.subjectSlug}/${ctx.subtopicSlug}/${slot}`);
  const difficulty = 2 + (h % 3);
  const name = ctx.subtopicName;
  const topic = ctx.topicName;

  const variants = [
    () =>
      mcq(
        `Practice · ${topic}: Which approach best matches CAPS assessment of "${name}"?`,
        "a",
        [
          { id: "a", text: `Apply ${name.toLowerCase()} in multi-step exam-style problems` },
          { id: "b", text: "Memorise definitions only with no application" },
          { id: "c", text: "Skip this subtopic in Grade 12 revision" },
          { id: "d", text: "Use only Grade 10 methods with no Grade 12 depth" },
        ],
        `CAPS expects applied work on ${name}, not rote-only recall.`,
        difficulty,
      ),
    () =>
      mcq(
        `Practice · ${name}: A common mistake in NSC scripts is to —`,
        "c",
        [
          { id: "a", text: "Show all working clearly" },
          { id: "b", text: "Use correct units and notation" },
          { id: "c", text: "Mix up concepts from unrelated topics" },
          { id: "d", text: "Check the reasonableness of the final answer" },
        ],
        `Coach tip: keep ${name} linked to ${topic} methods from CAPS.`,
        difficulty,
      ),
    () =>
      mcq(
        `Practice · Before attempting ${name} in an exam, you should —`,
        "b",
        [
          { id: "a", text: "Ignore the diagram or given data" },
          { id: "b", text: "Identify givens, required, and a suitable method" },
          { id: "c", text: "Copy a memorised answer without reading the question" },
          { id: "d", text: "Change the subject to an easier one mid-question" },
        ],
        `Exam technique for ${name}: plan from the stem, then execute.`,
        difficulty,
      ),
    () =>
      mcq(
        `Practice · ${name} at Grade 12 level typically includes —`,
        "d",
        [
          { id: "a", text: "Only one-mark recall questions" },
          { id: "b", text: "No links to other topics in the same subject" },
          { id: "c", text: "Content from outside the CAPS document" },
          { id: "d", text: `Extended tasks combining concepts from ${topic}` },
        ],
        `CAPS ${ctx.subjectName}: ${name} is assessed with Grade 12 depth.`,
        difficulty,
      ),
    () =>
      appliedMcq(
        ctx,
        `Practice · Past-paper style: ${name} is often combined with other ${topic} ideas. Best strategy:`,
      ),
    () =>
      mcq(
        `Practice · If your first attempt at a ${name} question fails, the best next step is —`,
        "a",
        [
          { id: "a", text: "Diagnose the error, revise the method, try a similar item" },
          { id: "b", text: "Stop practising this subtopic entirely" },
          { id: "c", text: "Guess randomly on the next ten questions" },
          { id: "d", text: "Only reread the textbook without doing questions" },
        ],
        `Adaptive practice: learn from mistakes on ${name}.`,
        difficulty,
      ),
  ];

  const pick = variants[(slot - 2 + h) % variants.length];
  const body = pick();
  return { ...body, difficulty: body.difficulty ?? difficulty };
}

/** Six CAPS-aligned practice bodies per subtopic (slot 1 = checkpoint-style core). */
export function buildCapsPracticeDepthSet(ctx) {
  const out = [];
  const core = buildCapsCheckpointBody(ctx);
  out.push({ ...core, difficulty: core.difficulty ?? 3 });
  for (let slot = 2; slot <= CAPS_PRACTICE_DEPTH_PER_SUBTOPIC; slot += 1) {
    out.push(buildPracticeVariant(ctx, slot));
  }
  return out;
}
