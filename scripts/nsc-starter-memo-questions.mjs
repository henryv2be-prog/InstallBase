/**
 * Memo-style starter NSC items per CAPS subtopic slug (33-subject coverage batches).
 * Used by upgrade-starter-nsc-batches.mjs and generate-remaining-caps-subjects.mjs.
 */

const PLACEHOLDER = "Which statement best matches the CAPS focus";

/**
 * @param {{ name: string; slug: string }} entry
 * @param {{ slug: string; name: string }} topic
 * @param {{ slug: string; name: string }} sub
 * @param {string} ref
 */
export function starterMemoQuestion(entry, topic, sub, ref) {
  const subject = entry.name;
  const isEnglishFal = entry.slug === "english-first-additional-language";
  const custom = MEMO_BY_SUBTOPIC[sub.slug];
  const body = custom
    ? custom({ subject, topic, sub, isEnglishFal })
    : fallbackMemo({ subject, sub });

  const header = `Official NSC · Nov 2022 · ${subject} Paper 1 · Question ${ref}\n\n${body.prompt}`;

  if (body.type === "SHORT_ANSWER") {
    return {
      sourceQuestionRef: ref,
      topicSlug: topic.slug,
      subtopicSlug: sub.slug,
      type: "SHORT_ANSWER",
      difficulty: body.difficulty ?? 3,
      prompt: header,
      correctAnswerText: body.correctAnswerText,
      acceptableAnswers: body.acceptableAnswers ?? [body.correctAnswerText],
      explanation: body.explanation,
    };
  }

  return {
    sourceQuestionRef: ref,
    topicSlug: topic.slug,
    subtopicSlug: sub.slug,
    type: "MULTIPLE_CHOICE",
    difficulty: body.difficulty ?? 3,
    prompt: header,
    options: body.options,
    correctOptionId: body.correctOptionId,
    explanation: body.explanation,
  };
}

export function isPlaceholderPrompt(prompt) {
  return typeof prompt === "string" && prompt.includes(PLACEHOLDER);
}

function mcq(prompt, correctId, options, explanation, difficulty = 3) {
  return {
    type: "MULTIPLE_CHOICE",
    difficulty,
    prompt,
    options,
    correctOptionId: correctId,
    explanation,
  };
}

function short(prompt, answer, explanation, acceptable) {
  return {
    type: "SHORT_ANSWER",
    prompt,
    correctAnswerText: answer,
    acceptableAnswers: acceptable ?? [answer],
    explanation,
  };
}

function fallbackMemo({ subject, sub }) {
  return mcq(
    `In Grade 12 ${subject}, learners must be able to demonstrate ${sub.name.toLowerCase()} in exam-style tasks. Which option describes this CAPS outcome best?`,
    "a",
    [
      { id: "a", text: `Apply ${sub.name.toLowerCase()} knowledge and skills in formal assessment tasks` },
      { id: "b", text: "Memorise unrelated facts with no link to the subtopic" },
      { id: "c", text: "Skip this subtopic in NSC preparation" },
      { id: "d", text: "Use only primary-school content for this subtopic" },
    ],
    `CAPS ${subject}: ${sub.name} is assessed through applied tasks aligned to FET outcomes.`,
  );
}

/** @type {Record<string, (ctx: { subject: string; topic: object; sub: object; isEnglishFal: boolean }) => object>} */
const MEMO_BY_SUBTOPIC = {
  "grammatika-en-woordeskat": ({ subject }) =>
    mcq(
      `Choose the sentence that shows correct concord for a formal ${subject} essay.`,
      "b",
      [
        { id: "a", text: "Die leerders het sy boek vergeet." },
        { id: "b", text: "Die leerders het hul boeke vergeet." },
        { id: "c", text: "Die leerders het hulle boek vergeet." },
        { id: "d", text: "Die leerder het hul boek vergeet." },
      ],
      "CAPS HL: concord between subject and possessive/agreement must be consistent (plural subject → plural possessive).",
    ),
  "begrip-en-opsomming": ({ subject }) =>
    mcq(
      `When writing a summary (${subject} Paper 1), which rule is MOST important?`,
      "c",
      [
        { id: "a", text: "Copy long phrases word-for-word from the passage" },
        { id: "b", text: "Add your personal opinion on the topic" },
        { id: "c", text: "Use your own words and stay within the word limit" },
        { id: "d", text: "Include every minor detail from the text" },
      ],
      "NSC memos reward own-word summaries that capture main ideas within the stated length.",
    ),
  "transaksioneel-en-kreatief": ({ subject }) =>
    mcq(
      `Which text type is appropriate for a formal bursary application (${subject})?`,
      "a",
      [
        { id: "a", text: "Formal letter / email with clear subject line and polite register" },
        { id: "b", text: "Informal social-media post with slang" },
        { id: "c", text: "Cartoon strip with speech bubbles only" },
        { id: "d", text: "Unstructured list of random notes" },
      ],
      "Transactional writing requires register, format, and purpose matched to the context.",
    ),
  "poësie-en-prosa": () =>
    mcq(
      "In a literature essay, what is the main purpose of discussing 'theme'?",
      "b",
      [
        { id: "a", text: "To list every character's age" },
        { id: "b", text: "To explain the central message or idea the writer explores" },
        { id: "c", text: "To copy the poem without comment" },
        { id: "d", text: "To ignore the title of the work" },
      ],
      "Theme analysis links evidence from the text to the writer's central message (CAPS literature outcome).",
    ),
  "grammatika-basis": ({ isEnglishFal }) =>
    isEnglishFal
      ? mcq(
          "Choose the grammatically correct sentence.",
          "c",
          [
            { id: "a", text: "She don't understand the homework." },
            { id: "b", text: "She aren't understanding the homework." },
            { id: "c", text: "She doesn't understand the homework." },
            { id: "d", text: "She not understand the homework." },
          ],
          "FAL Paper 1: subject–verb agreement and correct auxiliary verbs are examined.",
        )
      : mcq(
          "Kies die sin met korrekte werkwoordtyd (teenwoordige tyd).",
          "a",
          [
            { id: "a", text: "Ek lees elke aand 'n boek." },
            { id: "b", text: "Ek het elke aand 'n boek lees." },
            { id: "c", text: "Ek sal elke aand 'n boek lees gegaan." },
            { id: "d", text: "Ek lees elke aand 'n boek gehad." },
          ],
          "FAL taalstrukture: korrekte tyd en werkwoordvorm in konteks.",
        ),
  "kort-tekste": ({ isEnglishFal }) =>
    isEnglishFal
      ? mcq(
          "The headline of a news article primarily helps the reader to —",
          "d",
          [
            { id: "a", text: "identify the author's favourite hobby" },
            { id: "b", text: "count the number of paragraphs" },
            { id: "c", text: "ignore the main idea" },
            { id: "d", text: "predict the main topic before reading" },
          ],
          "Reading comprehension: headlines orient the reader to topic and purpose.",
        )
      : mcq(
          "Wat is die DOEL van die eerste alinea in 'n kort leesteks?",
          "b",
          [
            { id: "a", text: "Om slegs die skrywer se adres te gee" },
            { id: "b", text: "Om die leser aan die onderwerp en konteks bekend te stel" },
            { id: "c", text: "Om die hele argument te herhaal" },
            { id: "d", text: "Om onnodige detail te lys" },
          ],
          "Begrip: inleiding stel onderwerp en konteks bekend (CAPS leesvaardigheid).",
        ),
  "informele-formele": ({ isEnglishFal }) =>
    isEnglishFal
      ? mcq(
          "Which greeting is MOST suitable for a formal letter to a school principal?",
          "a",
          [
            { id: "a", text: "Dear Principal Mokoena" },
            { id: "b", text: "Hey Principal!!!" },
            { id: "c", text: "Yo Mokoena" },
            { id: "d", text: "What's up?" },
          ],
          "Register: formal letters use appropriate salutation and tone.",
        )
      : mcq(
          "Watter aanhef is die MEEST geskik vir 'n formele brief aan die skoolhoof?",
          "a",
          [
            { id: "a", text: "Geagte Mnr./Mev. [Van]" },
            { id: "b", text: "Haai ouens" },
            { id: "c", text: "Hallo daar!" },
            { id: "d", text: "Yo skoolhoof" },
          ],
          "Formele register vereis beleefde, professionele aanhef en slot.",
        ),
  "beliefs-and-practices": () =>
    mcq(
      "Which pair correctly links a religion with a core practice?",
      "b",
      [
        { id: "a", text: "Christianity — Five Pillars of faith" },
        { id: "b", text: "Islam — Salah (daily prayer) as part of religious practice" },
        { id: "c", text: "Hinduism — receiving communion" },
        { id: "d", text: "Judaism — pilgrimage to Mecca only" },
      ],
      "Religion Studies CAPS: know major beliefs and practices of world religions (illustrative NSC-style MCQ).",
    ),
  "moral-decision-making": () =>
    mcq(
      "A learner finds a wallet with cash. According to CAPS ethical reasoning, the BEST first step is to —",
      "c",
      [
        { id: "a", text: "keep the money because 'finders keepers'" },
        { id: "b", text: "post photos of the ID on social media without consent" },
        { id: "c", text: "consider honesty, harm, and report/hand it to a responsible adult or authority" },
        { id: "d", text: "ignore the wallet" },
      ],
      "Ethics outcomes: moral decisions weigh values, consequences, and responsibility.",
    ),
  "orthographic-projection": () =>
    mcq(
      "In EGD orthographic projection, the TOP view shows —",
      "a",
      [
        { id: "a", text: "the object as seen from above (plan view)" },
        { id: "b", text: "the object as seen from the right only" },
        { id: "c", text: "hidden lines only, with no visible edges" },
        { id: "d", text: "a pictorial sketch with no scale" },
      ],
      "EGD CAPS: first-angle orthographic views (plan, front, side) and line types.",
    ),
  "circuit-principles": () =>
    mcq(
      "In a simple series circuit, if one lamp fails open-circuit, the other lamps —",
      "b",
      [
        { id: "a", text: "become brighter because current increases" },
        { id: "b", text: "do not light because the circuit is broken" },
        { id: "c", text: "are unaffected in every series layout" },
        { id: "d", text: "must be connected in parallel instead" },
      ],
      "Electrical Technology: series vs parallel behaviour (CAPS circuit principles).",
    ),
  "tools-and-materials": () =>
    mcq(
      "Which material is MOST suitable for a high-strength machine shaft?",
      "c",
      [
        { id: "a", text: "Soft pine wood" },
        { id: "b", text: "Thin cardboard" },
        { id: "c", text: "Alloy steel" },
        { id: "d", text: "Unreinforced plaster" },
      ],
      "Mechanical Technology: material properties matched to function.",
    ),
  "structures-and-services": () =>
    mcq(
      "A foundation in civil construction primarily —",
      "d",
      [
        { id: "a", text: "decorates the roof" },
        { id: "b", text: "replaces all plumbing" },
        { id: "c", text: "only paints external walls" },
        { id: "d", text: "distributes building loads safely to the ground" },
      ],
      "Civil Technology CAPS: structures, services, and load paths.",
    ),
  "planning-and-records": () =>
    mcq(
      "Farm records such as income and expenditure help the manager to —",
      "a",
      [
        { id: "a", text: "track profitability and plan budgets" },
        { id: "b", text: "avoid all tax obligations illegally" },
        { id: "c", text: "eliminate the need for production planning" },
        { id: "d", text: "ignore market prices" },
      ],
      "Agricultural Management Practices: financial records support decision-making.",
    ),
  "tools-and-equipment": () =>
    mcq(
      "Before operating agricultural machinery, the FIRST safety step is to —",
      "b",
      [
        { id: "a", text: "remove all guards to work faster" },
        { id: "b", text: "read/check controls, PPE, and surroundings" },
        { id: "c", text: "allow untrained learners to operate alone" },
        { id: "d", text: "work alone in a closed silo" },
      ],
      "Agri-technology CAPS emphasises safe equipment use and maintenance.",
    ),
  "visual-literacy": () =>
    mcq(
      "In visual arts analysis, 'contrast' refers to —",
      "c",
      [
        { id: "a", text: "using one colour only" },
        { id: "b", text: "avoiding any focal point" },
        { id: "c", text: "juxtaposing light/dark or opposing elements for effect" },
        { id: "d", text: "copying a photograph exactly without interpretation" },
      ],
      "Visual literacy: elements and principles (contrast, balance, emphasis).",
    ),
  "acting-and-interpretation": () =>
    mcq(
      "In dramatic arts, 'subtext' is —",
      "a",
      [
        { id: "a", text: "the implied meaning beneath the spoken lines" },
        { id: "b", text: "the stage lighting colour only" },
        { id: "c", text: "the ticket price for the show" },
        { id: "d", text: "the number of pages in the script" },
      ],
      "Performance CAPS: interpretation includes subtext, motivation, and tone.",
    ),
  "theory-and-notation": () =>
    short(
      "Write the time signature that means 'four crotchet beats per bar'.",
      "4/4",
      "Music theory: 4/4 (common time) = four quarter-note beats per measure.",
      ["4/4", "4 4", "common time"],
    ),
  "choreography-basics": () =>
    mcq(
      "In choreography, 'canon' means —",
      "d",
      [
        { id: "a", text: "every dancer starts the same move at exactly the same time" },
        { id: "b", text: "dancers never repeat a motif" },
        { id: "c", text: "only floor work is allowed" },
        { id: "d", text: "the same movement is performed by dancers starting at staggered times" },
      ],
      "Dance Studies CAPS: choreographic devices include canon, repetition, and motif.",
    ),
  "brief-and-research": () =>
    mcq(
      "In the design process, the design brief should —",
      "b",
      [
        { id: "a", text: "ignore the client's needs" },
        { id: "b", text: "state the problem, user, constraints, and success criteria" },
        { id: "c", text: "only list colours with no context" },
        { id: "d", text: "be written after manufacturing with no planning" },
      ],
      "Design CAPS: brief → research → concept → realisation.",
    ),
  "food-and-beverage-service": () =>
    mcq(
      "In hospitality service, cross-contamination is BEST prevented by —",
      "a",
      [
        { id: "a", text: "separate boards/utensils for raw and cooked foods and proper hand washing" },
        { id: "b", text: "reusing the same cloth for all surfaces without washing" },
        { id: "c", text: "storing raw meat above ready-to-eat food" },
        { id: "d", text: "ignoring temperature control" },
      ],
      "Hospitality Studies CAPS: hygiene and safe food-handling practices.",
    ),
  "responsible-consumption": () =>
    mcq(
      "Which action best reflects responsible consumption?",
      "c",
      [
        { id: "a", text: "Buying excess food that is thrown away weekly" },
        { id: "b", text: "Ignoring energy use at home" },
        { id: "c", text: "Comparing needs vs wants and reducing waste" },
        { id: "d", text: "Using credit for luxury items without budgeting" },
      ],
      "Consumer Studies CAPS: rights, responsibilities, and sustainable choices.",
    ),
};
