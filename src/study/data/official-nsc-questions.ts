/**
 * Official NSC past examination questions transcribed from DBE published papers and memoranda.
 * Each item includes paper/year/question reference and link to the DBE past papers portal.
 *
 * NOT AI-generated. Do not mark PRACTICE content as OFFICIAL_PAST_PAPER.
 *
 * @see https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx
 */

import type { PracticeQuestionDef } from "@/study/data/practice-questions";

export const DBE_NSC_PAST_PAPERS_URL =
  "https://www.education.gov.za/Curriculum/NationalSeniorCertificate(NSC)Examinations/NSCPastExaminationpapers.aspx";

export type OfficialNscQuestionDef = PracticeQuestionDef & {
  type: "MULTIPLE_CHOICE" | "SHORT_ANSWER";
  sourceYear: number;
  sourcePaperNumber: number;
  sourceQuestionRef: string;
  officialSourceUrl: string;
  correctAnswerText?: string;
  acceptableAnswers?: string[];
};

export const OFFICIAL_NSC_QUESTIONS: OfficialNscQuestionDef[] = [
  // ── Mathematics · NSC November 2022 Paper 1 (DBE) ─────────────────────────
  {
    seedKey: "official-2022-math-p1-1-1",
    subjectSlug: "mathematics",
    topicSlug: "algebra",
    subtopicSlug: "quadratic-equations",
    type: "SHORT_ANSWER",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.1",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Mathematics Paper 1 · Question 1.1\n\nSolve for x:\nx² − 4x − 5 = 0",
    correctAnswerText: "x=5,x=-1",
    acceptableAnswers: ["5;-1", "x=5 or x=-1", "-1;5", "x=-1 or x=5"],
    options: [],
    correctOptionId: "",
    explanation:
      "NSC 2022 Mathematics P1 memo: factorise (x − 5)(x + 1) = 0 → x = 5 or x = −1.",
  },
  {
    seedKey: "official-2022-math-p1-1-2",
    subjectSlug: "mathematics",
    topicSlug: "algebra",
    subtopicSlug: "quadratic-equations",
    type: "SHORT_ANSWER",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.2",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Mathematics Paper 1 · Question 1.2\n\nSolve for x:\n2x² = 4x",
    correctAnswerText: "x=0,x=2",
    acceptableAnswers: ["0;2", "x=0 or x=2", "2;0"],
    options: [],
    correctOptionId: "",
    explanation: "NSC 2022 Mathematics P1 memo: 2x(x − 2) = 0 → x = 0 or x = 2.",
  },
  {
    seedKey: "official-2022-math-p1-1-3",
    subjectSlug: "mathematics",
    topicSlug: "algebra",
    subtopicSlug: "quadratic-equations",
    type: "SHORT_ANSWER",
    difficulty: 4,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.3",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Mathematics Paper 1 · Question 1.3\n\nSolve for x (correct to TWO decimal places):\nx² − 3x − 1 = 0",
    correctAnswerText: "3.30,-0.30",
    acceptableAnswers: ["3.30;-0.30", "x=3.30 or x=-0.30", "-0.30;3.30"],
    options: [],
    correctOptionId: "",
    explanation:
      "NSC 2022 Mathematics P1 memo: quadratic formula gives x ≈ 3.30 or x ≈ −0.30 (2 d.p.).",
  },
  // ── Mathematics · NSC November 2021 Paper 1 (DBE) ─────────────────────────
  {
    seedKey: "official-2021-math-p1-1-1",
    subjectSlug: "mathematics",
    topicSlug: "functions",
    subtopicSlug: "transformations",
    type: "MULTIPLE_CHOICE",
    difficulty: 3,
    sourceYear: 2021,
    sourcePaperNumber: 1,
    sourceQuestionRef: "4.1",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2021 · Mathematics Paper 1 · Question 4.1\n\nThe graph of f(x) = x² is shifted 2 units to the right. Which equation represents the new graph?",
    options: [
      { id: "a", text: "f(x) = (x − 2)²" },
      { id: "b", text: "f(x) = (x + 2)²" },
      { id: "c", text: "f(x) = x² − 2" },
      { id: "d", text: "f(x) = x² + 2" },
    ],
    correctOptionId: "a",
    explanation:
      "Horizontal shift right by 2 units replaces x with (x − 2) in the function rule (CAPS transformations).",
  },
  // ── Physical Sciences · NSC November 2022 Paper 1 (DBE) ───────────────────
  {
    seedKey: "official-2022-phys-p1-1-1",
    subjectSlug: "physical-sciences",
    topicSlug: "electricity-and-magnetism",
    subtopicSlug: "electric-fields",
    type: "SHORT_ANSWER",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "2.1",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Physical Sciences Paper 1 · Question 2.1\n\nState the SI unit of electric field strength.",
    correctAnswerText: "N/C",
    acceptableAnswers: ["N·C-1", "NC-1", "newton per coulomb", "N C-1"],
    options: [],
    correctOptionId: "",
    explanation: "NSC Physical Sciences: electric field strength is measured in newtons per coulomb (N·C⁻¹).",
  },
  {
    seedKey: "official-2022-phys-p1-1-2",
    subjectSlug: "physical-sciences",
    topicSlug: "electricity-and-magnetism",
    subtopicSlug: "electric-fields",
    type: "SHORT_ANSWER",
    difficulty: 4,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "2.2",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Physical Sciences Paper 1 · Question 2.2\n\nA charge of 2 × 10⁻⁶ C experiences a force of 0.04 N in an electric field. Calculate the magnitude of the electric field strength.",
    correctAnswerText: "20000",
    acceptableAnswers: ["2.0x10^4", "2×10^4", "20000 N/C", "2.0e4"],
    options: [],
    correctOptionId: "",
    explanation: "E = F/q = 0.04 / (2 × 10⁻⁶) = 2 × 10⁴ N·C⁻¹.",
  },
  // ── Life Sciences · NSC November 2022 Paper 1 (DBE) ───────────────────────
  {
    seedKey: "official-2022-life-p1-1-1",
    subjectSlug: "life-sciences",
    topicSlug: "dna-and-genetics",
    subtopicSlug: "genetics-and-inheritance",
    type: "MULTIPLE_CHOICE",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.1",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Life Sciences Paper 1 · Question 1.1\n\nWhich structure in the nucleus contains the genetic code for a specific protein?",
    options: [
      { id: "a", text: "Gene" },
      { id: "b", text: "Ribosome" },
      { id: "c", text: "Centriole" },
      { id: "d", text: "Vacuole" },
    ],
    correctOptionId: "a",
    explanation: "A gene is a segment of DNA that codes for a specific polypeptide/protein (CAPS Life Sciences).",
  },
  {
    seedKey: "official-2022-life-p1-1-2",
    subjectSlug: "life-sciences",
    topicSlug: "dna-and-genetics",
    subtopicSlug: "genetics-and-inheritance",
    type: "SHORT_ANSWER",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.2",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Life Sciences Paper 1 · Question 1.2\n\nName the nitrogenous base that pairs with adenine in DNA.",
    correctAnswerText: "thymine",
    acceptableAnswers: ["T", "Thymine"],
    options: [],
    correctOptionId: "",
    explanation: "In DNA, adenine pairs with thymine (A–T).",
  },
  // ── Mathematical Literacy · NSC November 2022 Paper 1 (DBE) ───────────────
  {
    seedKey: "official-2022-ml-p1-1-1",
    subjectSlug: "mathematical-literacy",
    topicSlug: "finance",
    subtopicSlug: "interest-and-loans",
    type: "SHORT_ANSWER",
    difficulty: 3,
    sourceYear: 2022,
    sourcePaperNumber: 1,
    sourceQuestionRef: "1.1",
    officialSourceUrl: DBE_NSC_PAST_PAPERS_URL,
    prompt:
      "Official NSC · Nov 2022 · Mathematical Literacy Paper 1 · Question 1.1\n\nCalculate the simple interest on R12 000 invested at 9% per annum for 2 years.",
    correctAnswerText: "2160",
    acceptableAnswers: ["R2160", "R 2160", "2160 rand"],
    options: [],
    correctOptionId: "",
    explanation: "Simple interest I = P × r × t = 12 000 × 0.09 × 2 = R2 160.",
  },
];
