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
    subtopics: {
      slug: string;
      name: string;
      sortOrder: number;
      /** Prerequisite within same subject: topic slug + subtopic slug */
      prerequisite?: { topicSlug: string; subtopicSlug: string };
    }[];
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
          {
            slug: "transformations",
            name: "Transformations of functions",
            sortOrder: 1,
            prerequisite: { topicSlug: "algebra", subtopicSlug: "quadratic-equations" },
          },
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
          {
            slug: "differentiation",
            name: "Differentiation (first principles & rules)",
            sortOrder: 1,
            prerequisite: { topicSlug: "algebra", subtopicSlug: "quadratic-equations" },
          },
          {
            slug: "applications-of-derivatives",
            name: "Applications of derivatives",
            sortOrder: 2,
            prerequisite: { topicSlug: "calculus", subtopicSlug: "differentiation" },
          },
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
  {
    slug: "accounting",
    name: "Accounting",
    sortOrder: 10,
    description: "Grade 12 Accounting (CAPS FET)",
    sourceTitle: "CAPS Accounting FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "financial-statements",
        name: "Financial statements of companies",
        sortOrder: 1,
        subtopics: [
          { slug: "statement-of-comprehensive-income", name: "Statement of comprehensive income", sortOrder: 1 },
          { slug: "statement-of-financial-position", name: "Statement of financial position", sortOrder: 2 },
        ],
      },
      {
        slug: "reconciliations",
        name: "Reconciliations",
        sortOrder: 2,
        subtopics: [{ slug: "bank-reconciliation", name: "Bank reconciliation", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "business-studies",
    name: "Business Studies",
    sortOrder: 11,
    description: "Grade 12 Business Studies (CAPS FET)",
    sourceTitle: "CAPS Business Studies FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "business-environments",
        name: "Business environments",
        sortOrder: 1,
        subtopics: [
          { slug: "micro-market-macro", name: "Micro, market and macro environments", sortOrder: 1 },
        ],
      },
      {
        slug: "leadership-management",
        name: "Leadership and management",
        sortOrder: 2,
        subtopics: [{ slug: "management-and-leadership", name: "Management vs leadership", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "economics",
    name: "Economics",
    sortOrder: 12,
    description: "Grade 12 Economics (CAPS FET)",
    sourceTitle: "CAPS Economics FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "macroeconomics",
        name: "Macroeconomics",
        sortOrder: 1,
        subtopics: [
          { slug: "circular-flow", name: "Circular flow of economic activity", sortOrder: 1 },
          { slug: "business-cycles", name: "Business cycles", sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "geography",
    name: "Geography",
    sortOrder: 20,
    description: "Grade 12 Geography (CAPS FET)",
    sourceTitle: "CAPS Geography FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "climate-and-weather",
        name: "Climate and weather",
        sortOrder: 1,
        subtopics: [{ slug: "midlatitude-cyclones", name: "Mid-latitude cyclones", sortOrder: 1 }],
      },
      {
        slug: "geomorphology",
        name: "Geomorphology",
        sortOrder: 2,
        subtopics: [{ slug: "fluvial-processes", name: "Fluvial processes", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "history",
    name: "History",
    sortOrder: 21,
    description: "Grade 12 History (CAPS FET)",
    sourceTitle: "CAPS History FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "cold-war",
        name: "The Cold War",
        sortOrder: 1,
        subtopics: [{ slug: "origins-and-escalation", name: "Origins and escalation", sortOrder: 1 }],
      },
      {
        slug: "civil-society-protests",
        name: "Civil society protests (1970s–1990s)",
        sortOrder: 2,
        subtopics: [{ slug: "south-africa-1970s-1990s", name: "South Africa 1970s–1990s", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "english-home-language",
    name: "English Home Language",
    sortOrder: 30,
    description: "Grade 12 English HL (CAPS FET)",
    sourceTitle: "CAPS English Home Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "language-structures",
        name: "Language structures and conventions",
        sortOrder: 1,
        subtopics: [{ slug: "grammar-and-usage", name: "Grammar and usage", sortOrder: 1 }],
      },
      {
        slug: "literature",
        name: "Literature",
        sortOrder: 2,
        subtopics: [{ slug: "poetry-and-prose-analysis", name: "Poetry and prose analysis", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "afrikaans-home-language",
    name: "Afrikaans Home Language",
    sortOrder: 32,
    description: "Grade 12 Afrikaans Huistaal (CAPS FET)",
    sourceTitle: "CAPS Afrikaans Home Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "taalstrukture",
        name: "Taalstrukture en -konvensies",
        sortOrder: 1,
        importance: 1.2,
        subtopics: [
          { slug: "werkwoorde-en-tye", name: "Werkwoorde en tye", sortOrder: 1 },
          { slug: "sinonieme-en-woordpatrone", name: "Sinonieme, antonieme en woordpatrone", sortOrder: 2 },
        ],
      },
      {
        slug: "lees-en-kyk",
        name: "Lees en kyk",
        sortOrder: 2,
        importance: 1.1,
        subtopics: [
          { slug: "begrip-en-opsomming", name: "Begripstoets en opsomming", sortOrder: 1 },
        ],
      },
      {
        slug: "skryf",
        name: "Skryf",
        sortOrder: 3,
        subtopics: [
          { slug: "transaksioneel", name: "Transaksionele tekste", sortOrder: 1 },
          { slug: "kreatief", name: "Kreatiewe skryfwerk", sortOrder: 2 },
        ],
      },
      {
        slug: "letterkunde",
        name: "Letterkunde",
        sortOrder: 4,
        importance: 1.15,
        subtopics: [
          { slug: "poësie-analise", name: "Poësie-analise", sortOrder: 1 },
          { slug: "prosa-en-drama", name: "Prosa en drama", sortOrder: 2 },
        ],
      },
    ],
  },
  {
    slug: "afrikaans-first-additional-language",
    name: "Afrikaans First Additional Language",
    sortOrder: 33,
    description: "Grade 12 Afrikaans Eerste Addisionele Taal (CAPS FET)",
    sourceTitle: "CAPS Afrikaans First Additional Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "taalstrukture-fal",
        name: "Taalstrukture",
        sortOrder: 1,
        subtopics: [
          { slug: "grammatika-basis", name: "Grammatika: werkwoorde en sinbou", sortOrder: 1 },
        ],
      },
      {
        slug: "lees-fal",
        name: "Lees en begrip",
        sortOrder: 2,
        subtopics: [{ slug: "kort-tekste", name: "Kort tekste en advertensies", sortOrder: 1 }],
      },
      {
        slug: "skryf-fal",
        name: "Skryf",
        sortOrder: 3,
        subtopics: [{ slug: "informele-formele", name: "Informele en formele brief", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "tourism",
    name: "Tourism",
    sortOrder: 90,
    description: "Grade 12 Tourism (CAPS FET)",
    sourceTitle: "CAPS Tourism FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "domestic-regional-international",
        name: "Domestic, regional and international tourism",
        sortOrder: 1,
        subtopics: [{ slug: "tourism-sectors", name: "Tourism sectors and services", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "computer-applications-technology",
    name: "Computer Applications Technology (CAT)",
    sortOrder: 60,
    description: "Grade 12 CAT (CAPS FET)",
    sourceTitle: "CAPS Computer Applications Technology FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "systems-technologies",
        name: "Systems technologies",
        sortOrder: 1,
        subtopics: [{ slug: "hardware-and-software", name: "Hardware and software systems", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "information-technology",
    name: "Information Technology (IT)",
    sortOrder: 61,
    description: "Grade 12 IT (CAPS FET)",
    sourceTitle: "CAPS Information Technology FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "programming",
        name: "Programming and problem-solving",
        sortOrder: 1,
        subtopics: [{ slug: "algorithms-and-code", name: "Algorithms and coding concepts", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "agricultural-sciences",
    name: "Agricultural Sciences",
    sortOrder: 70,
    description: "Grade 12 Agricultural Sciences (CAPS FET)",
    sourceTitle: "CAPS Agricultural Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "animal-nutrition",
        name: "Animal nutrition",
        sortOrder: 1,
        subtopics: [{ slug: "digestion-and-feed", name: "Digestion and feed components", sortOrder: 1 }],
      },
    ],
  },
  {
    slug: "life-orientation",
    name: "Life Orientation",
    sortOrder: 93,
    description: "Grade 12 Life Orientation (CAPS FET)",
    sourceTitle: "CAPS Life Orientation FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: "2026 prototype starter (partial topics)",
    topics: [
      {
        slug: "development-of-the-self",
        name: "Development of the self in society",
        sortOrder: 1,
        subtopics: [{ slug: "career-and-study-skills", name: "Career and study skills", sortOrder: 1 }],
      },
    ],
  },
];
