/**
 * Starter CAPS-aligned curriculum slices for Grade 12 NSC prototype testing.
 * Topic names follow DBE CAPS FET subject frameworks; coverage is intentionally partial.
 * @see https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx
 */

export type StudyCurriculumStarterSubject = {
  slug: string;
  name: string;
  sortOrder: number;
  description: string;
  sourceTitle: string;
  sourceUrl: string;
  versionLabel: string;
  topics: {
    slug: string;
    name: string;
    sortOrder: number;
    importance?: number;
    subtopics: { slug: string; name: string; sortOrder: number }[];
  }[];
};

/** Partial prototype dataset — not complete NSC coverage. */
export const GRADE_12_CURRICULUM_STARTER: StudyCurriculumStarterSubject[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    sortOrder: 1,
    description: "Grade 12 Mathematics (CAPS FET)",
    sourceTitle: "CAPS Mathematics FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICS%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "functions",
        name: "Functions",
        sortOrder: 1,
        importance: 1.2,
        subtopics: [
          { slug: "transformations", name: "Transformations of functions", sortOrder: 1 },
          { slug: "inverses", name: "Inverses of functions", sortOrder: 2 },
        ],
      },
      {
        slug: "algebra",
        name: "Algebra",
        sortOrder: 2,
        importance: 1.1,
        subtopics: [
          { slug: "quadratic-equations", name: "Quadratic equations and inequalities", sortOrder: 1 },
          { slug: "simultaneous-equations", name: "Simultaneous equations", sortOrder: 2 },
        ],
      },
      {
        slug: "calculus",
        name: "Calculus",
        sortOrder: 3,
        importance: 1.3,
        subtopics: [
          { slug: "differentiation", name: "Differentiation (first principles & rules)", sortOrder: 1 },
          { slug: "applications-of-derivatives", name: "Applications of derivatives", sortOrder: 2 },
        ],
      },
      {
        slug: "trigonometry",
        name: "Trigonometry",
        sortOrder: 4,
        subtopics: [
          { slug: "compound-angle-identities", name: "Compound angle identities", sortOrder: 1 },
          { slug: "trigonometric-equations", name: "Trigonometric equations", sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "mathematical-literacy",
    name: "Mathematical Literacy",
    sortOrder: 2,
    description: "Grade 12 Mathematical Literacy (CAPS FET)",
    sourceTitle: "CAPS Mathematical Literacy FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICAL%20LITERACY%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "finance",
        name: "Finance",
        sortOrder: 1,
        importance: 1.2,
        subtopics: [
          { slug: "interest-and-loans", name: "Interest, loans and investments", sortOrder: 1 },
          { slug: "tax-and-inflation", name: "Tax, inflation and exchange rates", sortOrder: 2 },
        ],
      },
      {
        slug: "measurement",
        name: "Measurement",
        sortOrder: 2,
        subtopics: [
          { slug: "area-and-volume", name: "Area, volume and conversions", sortOrder: 1 },
        ],
      },
      {
        slug: "data-handling",
        name: "Data handling",
        sortOrder: 3,
        subtopics: [
          { slug: "interpreting-graphs", name: "Interpreting graphs and tables", sortOrder: 1 },
          { slug: "probability-basics", name: "Probability in everyday contexts", sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "physical-sciences",
    name: "Physical Sciences",
    sortOrder: 3,
    description: "Grade 12 Physical Sciences (CAPS FET)",
    sourceTitle: "CAPS Physical Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20PHYSICAL%20SCIENCES%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "mechanics",
        name: "Mechanics",
        sortOrder: 1,
        importance: 1.1,
        subtopics: [
          { slug: "vertical-projectile-motion", name: "Vertical projectile motion", sortOrder: 1 },
          { slug: "momentum-and-impulse", name: "Momentum and impulse", sortOrder: 2 },
        ],
      },
      {
        slug: "electricity-and-magnetism",
        name: "Electricity and magnetism",
        sortOrder: 2,
        importance: 1.2,
        subtopics: [
          { slug: "electric-fields", name: "Electric fields", sortOrder: 1 },
          { slug: "electrodynamics", name: "Electrodynamics", sortOrder: 2 },
        ],
      },
      {
        slug: "chemical-change",
        name: "Chemical change",
        sortOrder: 3,
        subtopics: [
          { slug: "rate-and-extent-of-reactions", name: "Rate and extent of reactions", sortOrder: 1 },
          { slug: "chemical-equilibrium", name: "Chemical equilibrium", sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "life-sciences",
    name: "Life Sciences",
    sortOrder: 4,
    description: "Grade 12 Life Sciences (CAPS FET)",
    sourceTitle: "CAPS Life Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20LIFE%20SCIENCES%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "dna-and-genetics",
        name: "DNA: the code of life",
        sortOrder: 1,
        importance: 1.2,
        subtopics: [
          { slug: "dna-replication-and-protein-synthesis", name: "DNA replication and protein synthesis", sortOrder: 1 },
          { slug: "genetics-and-inheritance", name: "Genetics and inheritance", sortOrder: 2 },
        ],
      },
      {
        slug: "evolution",
        name: "Evolution",
        sortOrder: 2,
        subtopics: [
          { slug: "natural-selection", name: "Natural selection and speciation", sortOrder: 1 },
        ],
      },
      {
        slug: "human-impact",
        name: "Human impact on the environment",
        sortOrder: 3,
        subtopics: [
          { slug: "biodiversity-and-conservation", name: "Biodiversity and conservation", sortOrder: 1 },
        ],
      },
    ],
  },
];

/** Additional Grade 12 subjects — structure only (no curriculum topics yet). */
export const GRADE_12_SUBJECT_STUBS: { slug: string; name: string; sortOrder: number }[] = [
  { slug: "accounting", name: "Accounting", sortOrder: 10 },
  { slug: "business-studies", name: "Business Studies", sortOrder: 11 },
  { slug: "economics", name: "Economics", sortOrder: 12 },
  { slug: "geography", name: "Geography", sortOrder: 13 },
  { slug: "history", name: "History", sortOrder: 14 },
  { slug: "english-home-language", name: "English Home Language", sortOrder: 15 },
  { slug: "english-first-additional-language", name: "English First Additional Language", sortOrder: 16 },
  { slug: "afrikaans-home-language", name: "Afrikaans Home Language", sortOrder: 17 },
  { slug: "afrikaans-first-additional-language", name: "Afrikaans First Additional Language", sortOrder: 18 },
  { slug: "isiZulu-home-language", name: "isiZulu Home Language", sortOrder: 19 },
  { slug: "computer-applications-technology", name: "Computer Applications Technology", sortOrder: 20 },
  { slug: "information-technology", name: "Information Technology", sortOrder: 21 },
  { slug: "tourism", name: "Tourism", sortOrder: 22 },
  { slug: "visual-arts", name: "Visual Arts", sortOrder: 23 },
];
