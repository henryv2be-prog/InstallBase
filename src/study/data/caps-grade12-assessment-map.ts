/**
 * CAPS FET Grade 12 assessment taxonomy — topic/subtopic slugs for tracking mastery,
 * not teaching content. Aligned to DBE CAPS subject frameworks (Grades 10–12).
 */

type CapsSubtopic = {
  slug: string;
  name: string;
  sortOrder: number;
  prerequisite?: { topicSlug: string; subtopicSlug: string };
};

export type CapsTopic = {
  slug: string;
  name: string;
  sortOrder: number;
  importance?: number;
  subtopics: CapsSubtopic[];
};

const CAPS_TOPICS_BY_SUBJECT: Record<string, CapsTopic[]> = {
  mathematics: [
    {
      slug: "functions",
      name: "Functions",
      sortOrder: 1,
      importance: 1.2,
      subtopics: [
        { slug: "exponential-and-logarithmic", name: "Exponential and logarithmic functions", sortOrder: 1 },
        { slug: "inverses", name: "Inverses of functions", sortOrder: 2 },
        { slug: "transformations", name: "Transformations of functions", sortOrder: 3 },
        {
          slug: "rational-functions",
          name: "Rational functions and asymptotes",
          sortOrder: 4,
          prerequisite: { topicSlug: "functions", subtopicSlug: "transformations" },
        },
      ],
    },
    {
      slug: "sequences-and-series",
      name: "Number patterns, sequences and series",
      sortOrder: 2,
      importance: 1.15,
      subtopics: [
        { slug: "quadratic-sequences", name: "Quadratic number patterns", sortOrder: 1 },
        { slug: "arithmetic-sequences", name: "Arithmetic sequences and series", sortOrder: 2 },
        { slug: "geometric-sequences", name: "Geometric sequences and series", sortOrder: 3 },
        { slug: "sigma-notation", name: "Sigma notation and series formulae", sortOrder: 4 },
      ],
    },
    {
      slug: "finance",
      name: "Finance, growth and decay",
      sortOrder: 3,
      importance: 1.1,
      subtopics: [
        { slug: "simple-and-compound-growth", name: "Simple and compound growth and decay", sortOrder: 1 },
        { slug: "annuities-and-loans", name: "Annuities, loans and sinking funds", sortOrder: 2 },
      ],
    },
    {
      slug: "algebra",
      name: "Algebra",
      sortOrder: 4,
      importance: 1.1,
      subtopics: [
        { slug: "quadratic-equations", name: "Quadratic equations and inequalities", sortOrder: 1 },
        { slug: "simultaneous-equations", name: "Simultaneous equations", sortOrder: 2 },
        { slug: "nature-of-roots", name: "Nature of roots and discriminant", sortOrder: 3 },
      ],
    },
    {
      slug: "calculus",
      name: "Calculus",
      sortOrder: 5,
      importance: 1.25,
      subtopics: [
        {
          slug: "differentiation",
          name: "Differentiation (first principles and rules)",
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
      slug: "analytical-geometry",
      name: "Analytical geometry",
      sortOrder: 6,
      importance: 1.15,
      subtopics: [
        { slug: "straight-line", name: "Equation of a straight line", sortOrder: 1 },
        { slug: "circle-geometry", name: "Equation of a circle and tangents", sortOrder: 2 },
      ],
    },
    {
      slug: "trigonometry",
      name: "Trigonometry",
      sortOrder: 7,
      importance: 1.2,
      subtopics: [
        { slug: "reductions-and-graphs", name: "Reduction formulas and trig graphs", sortOrder: 1 },
        { slug: "compound-angle-identities", name: "Compound angle identities", sortOrder: 2 },
        { slug: "trigonometric-equations", name: "Trigonometric equations", sortOrder: 3 },
        { slug: "sine-cosine-area-rules", name: "Sine rule, cosine rule and area rule", sortOrder: 4 },
        { slug: "trigonometry-in-3d", name: "Trigonometry in two and three dimensions", sortOrder: 5 },
      ],
    },
    {
      slug: "euclidean-geometry",
      name: "Euclidean geometry",
      sortOrder: 8,
      importance: 1.2,
      subtopics: [
        { slug: "proportion-and-similarity", name: "Proportionality and similar triangles", sortOrder: 1 },
        { slug: "circle-geometry-proofs", name: "Circle geometry theorems and riders", sortOrder: 2 },
      ],
    },
    {
      slug: "statistics",
      name: "Statistics",
      sortOrder: 9,
      subtopics: [
        { slug: "regression-and-correlation", name: "Regression and correlation", sortOrder: 1 },
        { slug: "measures-of-dispersion", name: "Variance, standard deviation and interpretation", sortOrder: 2 },
      ],
    },
    {
      slug: "probability",
      name: "Counting principles and probability",
      sortOrder: 10,
      subtopics: [
        { slug: "counting-principles", name: "Fundamental counting principle and permutations", sortOrder: 1 },
        { slug: "probability-rules", name: "Probability of combined events", sortOrder: 2 },
      ],
    },
  ],

  "mathematical-literacy": [
    {
      slug: "finance",
      name: "Finance",
      sortOrder: 1,
      importance: 1.2,
      subtopics: [
        { slug: "interest-and-loans", name: "Interest, loans and investments", sortOrder: 1 },
        { slug: "tax-and-inflation", name: "Tax, inflation and exchange rates", sortOrder: 2 },
        { slug: "banking-and-budgets", name: "Bank statements, budgets and tariffs", sortOrder: 3 },
      ],
    },
    {
      slug: "measurement",
      name: "Measurement",
      sortOrder: 2,
      subtopics: [
        { slug: "area-and-volume", name: "Area, volume and conversions", sortOrder: 1 },
        { slug: "plans-and-models", name: "Plans, scale and models", sortOrder: 2 },
      ],
    },
    {
      slug: "maps-and-plans",
      name: "Maps and plans",
      sortOrder: 3,
      subtopics: [{ slug: "scale-and-direction", name: "Scale, distance and direction", sortOrder: 1 }],
    },
    {
      slug: "data-handling",
      name: "Data handling",
      sortOrder: 4,
      subtopics: [
        { slug: "interpreting-graphs", name: "Interpreting graphs and tables", sortOrder: 1 },
        { slug: "probability-basics", name: "Probability in everyday contexts", sortOrder: 2 },
        { slug: "critique-of-statistics", name: "Critically analysing statistical reports", sortOrder: 3 },
      ],
    },
  ],

  "physical-sciences": [
    {
      slug: "mechanics",
      name: "Mechanics",
      sortOrder: 1,
      importance: 1.15,
      subtopics: [
        { slug: "vertical-projectile-motion", name: "Vertical projectile motion", sortOrder: 1 },
        { slug: "work-energy-power", name: "Work, energy and power", sortOrder: 2 },
        { slug: "momentum-and-impulse", name: "Momentum and impulse", sortOrder: 3 },
      ],
    },
    {
      slug: "waves-and-light",
      name: "Waves, sound and light",
      sortOrder: 2,
      subtopics: [
        { slug: "doppler-effect", name: "The Doppler effect", sortOrder: 1 },
        { slug: "photoelectric-effect", name: "Photoelectric effect", sortOrder: 2 },
      ],
    },
    {
      slug: "electricity-and-magnetism",
      name: "Electricity and magnetism",
      sortOrder: 3,
      importance: 1.2,
      subtopics: [
        { slug: "electric-fields", name: "Electric fields", sortOrder: 1 },
        { slug: "electrodynamics", name: "Electrodynamics (motors and generators)", sortOrder: 2 },
        { slug: "electromagnetic-induction", name: "Electromagnetic induction", sortOrder: 3 },
      ],
    },
    {
      slug: "chemical-change",
      name: "Chemical change",
      sortOrder: 4,
      subtopics: [
        { slug: "rate-and-extent-of-reactions", name: "Rate and extent of reactions", sortOrder: 1 },
        { slug: "chemical-equilibrium", name: "Chemical equilibrium", sortOrder: 2 },
        { slug: "acids-and-bases", name: "Acids and bases", sortOrder: 3 },
        { slug: "electrochemistry", name: "Electrochemical cells", sortOrder: 4 },
        { slug: "organic-chemistry", name: "Organic chemistry", sortOrder: 5 },
      ],
    },
  ],

  "life-sciences": [
    {
      slug: "dna-and-genetics",
      name: "DNA: the code of life",
      sortOrder: 1,
      importance: 1.2,
      subtopics: [
        { slug: "meiosis", name: "Meiosis and genetic variation", sortOrder: 1 },
        { slug: "dna-replication-and-protein-synthesis", name: "DNA replication and protein synthesis", sortOrder: 2 },
        { slug: "genetics-and-inheritance", name: "Genetics and inheritance", sortOrder: 3 },
      ],
    },
    {
      slug: "evolution",
      name: "Evolution",
      sortOrder: 2,
      subtopics: [
        { slug: "natural-selection", name: "Natural selection and speciation", sortOrder: 1 },
        { slug: "human-evolution", name: "Human evolution", sortOrder: 2 },
      ],
    },
    {
      slug: "human-responses",
      name: "Human endocrine and nervous systems",
      sortOrder: 3,
      subtopics: [
        { slug: "endocrine-system", name: "Endocrine system and homeostasis", sortOrder: 1 },
        { slug: "nervous-system", name: "Nervous system and responses", sortOrder: 2 },
      ],
    },
    {
      slug: "plant-and-animal-responses",
      name: "Plant and animal responses",
      sortOrder: 4,
      subtopics: [
        { slug: "photosynthesis-and-respiration", name: "Photosynthesis and cellular respiration", sortOrder: 1 },
        { slug: "animal-responses", name: "Animal responses to the environment", sortOrder: 2 },
      ],
    },
    {
      slug: "human-impact",
      name: "Human impact on the environment",
      sortOrder: 5,
      subtopics: [
        { slug: "biodiversity-and-conservation", name: "Biodiversity and conservation", sortOrder: 1 },
        { slug: "human-activities-and-ecosystems", name: "Human activities and ecosystems", sortOrder: 2 },
      ],
    },
  ],

  accounting: [
    {
      slug: "companies",
      name: "Companies and GAAP",
      sortOrder: 1,
      subtopics: [
        { slug: "company-legislation", name: "Companies Act and internal controls", sortOrder: 1 },
        { slug: "inventory-valuation", name: "Inventory systems and valuation", sortOrder: 2 },
      ],
    },
    {
      slug: "financial-statements",
      name: "Financial statements of companies",
      sortOrder: 2,
      importance: 1.2,
      subtopics: [
        { slug: "statement-of-comprehensive-income", name: "Statement of comprehensive income", sortOrder: 1 },
        { slug: "statement-of-financial-position", name: "Statement of financial position", sortOrder: 2 },
        { slug: "cash-flow-statement", name: "Cash flow statement", sortOrder: 3 },
        { slug: "notes-to-financial-statements", name: "Notes to the financial statements", sortOrder: 4 },
      ],
    },
    {
      slug: "reconciliations",
      name: "Reconciliations and VAT",
      sortOrder: 3,
      subtopics: [
        { slug: "bank-reconciliation", name: "Bank reconciliation", sortOrder: 1 },
        { slug: "debtors-creditors-reconciliation", name: "Debtors and creditors reconciliation", sortOrder: 2 },
        { slug: "vat-calculations", name: "VAT calculations and returns", sortOrder: 3 },
      ],
    },
    {
      slug: "manufacturing",
      name: "Manufacturing accounts",
      sortOrder: 4,
      subtopics: [{ slug: "production-cost-statements", name: "Production cost statements", sortOrder: 1 }],
    },
    {
      slug: "ethics",
      name: "Ethics and internal control",
      sortOrder: 5,
      subtopics: [{ slug: "code-of-ethics", name: "Code of ethics and corporate governance", sortOrder: 1 }],
    },
  ],

  "business-studies": [
    {
      slug: "business-environments",
      name: "Business environments",
      sortOrder: 1,
      subtopics: [
        { slug: "micro-market-macro", name: "Micro, market and macro environments", sortOrder: 1 },
        { slug: "business-sectors", name: "Primary, secondary and tertiary sectors", sortOrder: 2 },
      ],
    },
    {
      slug: "leadership-management",
      name: "Leadership and management",
      sortOrder: 2,
      subtopics: [
        { slug: "management-and-leadership", name: "Management vs leadership", sortOrder: 1 },
        { slug: "motivation-and-communication", name: "Motivation, communication and teams", sortOrder: 2 },
      ],
    },
    {
      slug: "investments-insurance",
      name: "Investments and insurance",
      sortOrder: 3,
      subtopics: [{ slug: "investment-securities", name: "Investment and insurance options", sortOrder: 1 }],
    },
    {
      slug: "creative-thinking",
      name: "Creative thinking and problem solving",
      sortOrder: 4,
      subtopics: [{ slug: "business-opportunities", name: "Business opportunities and feasibility", sortOrder: 1 }],
    },
    {
      slug: "forms-of-ownership",
      name: "Forms of ownership",
      sortOrder: 5,
      subtopics: [{ slug: "ownership-types", name: "Sole trader, partnership, company, close corporation", sortOrder: 1 }],
    },
    {
      slug: "human-resources",
      name: "Human resources",
      sortOrder: 6,
      subtopics: [
        { slug: "recruitment-and-training", name: "Recruitment, selection and training", sortOrder: 1 },
        { slug: "labour-legislation", name: "Labour relations and legislation", sortOrder: 2 },
      ],
    },
    {
      slug: "marketing",
      name: "Marketing",
      sortOrder: 7,
      subtopics: [{ slug: "marketing-mix", name: "Marketing mix and strategies", sortOrder: 1 }],
    },
    {
      slug: "production",
      name: "Production function",
      sortOrder: 8,
      subtopics: [{ slug: "production-operations", name: "Production, quality and productivity", sortOrder: 1 }],
    },
  ],

  economics: [
    {
      slug: "macroeconomics",
      name: "Macroeconomics",
      sortOrder: 1,
      subtopics: [
        { slug: "circular-flow", name: "Circular flow of economic activity", sortOrder: 1 },
        { slug: "business-cycles", name: "Business cycles", sortOrder: 2 },
        { slug: "public-sector", name: "Public sector and fiscal policy", sortOrder: 3 },
      ],
    },
    {
      slug: "microeconomics",
      name: "Microeconomics",
      sortOrder: 2,
      subtopics: [
        { slug: "demand-and-supply", name: "Demand, supply and equilibrium", sortOrder: 1 },
        { slug: "market-structures", name: "Market structures", sortOrder: 2 },
      ],
    },
    {
      slug: "economic-pursuits",
      name: "Economic pursuits",
      sortOrder: 3,
      subtopics: [
        { slug: "growth-and-development", name: "Growth, development and indicators", sortOrder: 1 },
        { slug: "south-african-economy", name: "Contemporary South African economy", sortOrder: 2 },
      ],
    },
  ],

  geography: [
    {
      slug: "climate-and-weather",
      name: "Climate and weather",
      sortOrder: 1,
      subtopics: [
        { slug: "midlatitude-cyclones", name: "Mid-latitude cyclones", sortOrder: 1 },
        { slug: "tropical-cyclones", name: "Tropical cyclones", sortOrder: 2 },
        { slug: "local-climates", name: "Local climates of South Africa", sortOrder: 3 },
      ],
    },
    {
      slug: "geomorphology",
      name: "Geomorphology",
      sortOrder: 2,
      subtopics: [
        { slug: "fluvial-processes", name: "Fluvial processes", sortOrder: 1 },
        { slug: "mass-movement", name: "Slope processes and mass movement", sortOrder: 2 },
      ],
    },
    {
      slug: "development",
      name: "Development geography",
      sortOrder: 3,
      subtopics: [
        { slug: "development-theories", name: "Development theories and inequality", sortOrder: 1 },
        { slug: "food-security", name: "Food security in Southern Africa", sortOrder: 2 },
      ],
    },
    {
      slug: "resources",
      name: "Resources and sustainability",
      sortOrder: 4,
      subtopics: [{ slug: "energy-and-water", name: "Energy and water resources", sortOrder: 1 }],
    },
  ],

  history: [
    {
      slug: "cold-war",
      name: "The Cold War",
      sortOrder: 1,
      subtopics: [
        { slug: "origins-and-escalation", name: "Origins and escalation", sortOrder: 1 },
        { slug: "collapse-and-impact", name: "Collapse of the Soviet Union and global impact", sortOrder: 2 },
      ],
    },
    {
      slug: "civil-society-protests",
      name: "Civil society protests (1970s–1990s)",
      sortOrder: 2,
      subtopics: [
        { slug: "south-africa-1970s-1990s", name: "South Africa 1970s–1990s", sortOrder: 1 },
        { slug: "global-protest-movements", name: "Global protest movements", sortOrder: 2 },
      ],
    },
    {
      slug: "independent-africa",
      name: "Independent Africa",
      sortOrder: 3,
      subtopics: [{ slug: "decolonisation-case-studies", name: "Decolonisation case studies", sortOrder: 1 }],
    },
  ],

  "english-home-language": [
    {
      slug: "language-structures",
      name: "Language structures and conventions",
      sortOrder: 1,
      subtopics: [
        { slug: "grammar-and-usage", name: "Grammar and usage", sortOrder: 1 },
        { slug: "visual-literacy", name: "Visual and media literacy", sortOrder: 2 },
      ],
    },
    {
      slug: "reading",
      name: "Reading and viewing",
      sortOrder: 2,
      subtopics: [{ slug: "comprehension-and-summary", name: "Comprehension and summary", sortOrder: 1 }],
    },
    {
      slug: "writing",
      name: "Writing and presenting",
      sortOrder: 3,
      subtopics: [
        { slug: "transactional-writing", name: "Transactional writing", sortOrder: 1 },
        { slug: "creative-writing", name: "Creative writing", sortOrder: 2 },
      ],
    },
    {
      slug: "literature",
      name: "Literature",
      sortOrder: 4,
      importance: 1.15,
      subtopics: [
        { slug: "poetry-and-prose-analysis", name: "Poetry and prose analysis", sortOrder: 1 },
        { slug: "drama-analysis", name: "Drama analysis", sortOrder: 2 },
      ],
    },
  ],

  tourism: [
    {
      slug: "domestic-regional-international",
      name: "Domestic, regional and international tourism",
      sortOrder: 1,
      subtopics: [
        { slug: "tourism-sectors", name: "Tourism sectors and services", sortOrder: 1 },
        { slug: "tourism-geography", name: "Tourism geography and attractions", sortOrder: 2 },
      ],
    },
    {
      slug: "sustainable-tourism",
      name: "Sustainable and responsible tourism",
      sortOrder: 2,
      subtopics: [{ slug: "responsible-tourism", name: "Responsible tourism practices", sortOrder: 1 }],
    },
    {
      slug: "tourism-marketing",
      name: "Tourism marketing",
      sortOrder: 3,
      subtopics: [{ slug: "marketing-strategies", name: "Marketing strategies and SA tourism", sortOrder: 1 }],
    },
  ],

  "computer-applications-technology": [
    {
      slug: "systems-technologies",
      name: "Systems technologies",
      sortOrder: 1,
      subtopics: [
        { slug: "hardware-and-software", name: "Hardware and software systems", sortOrder: 1 },
        { slug: "networks-and-internet", name: "Networks, internet and security", sortOrder: 2 },
      ],
    },
    {
      slug: "information-management",
      name: "Information management",
      sortOrder: 2,
      subtopics: [{ slug: "data-and-databases", name: "Data handling and databases", sortOrder: 1 }],
    },
    {
      slug: "integrated-applications",
      name: "Integrated applications",
      sortOrder: 3,
      subtopics: [{ slug: "word-processing-spreadsheets", name: "Word processing and spreadsheets", sortOrder: 1 }],
    },
  ],

  "information-technology": [
    {
      slug: "programming",
      name: "Programming and problem-solving",
      sortOrder: 1,
      subtopics: [
        { slug: "algorithms-and-code", name: "Algorithms and coding concepts", sortOrder: 1 },
        { slug: "data-structures", name: "Data structures and files", sortOrder: 2 },
      ],
    },
    {
      slug: "hardware-software",
      name: "Hardware and software",
      sortOrder: 2,
      subtopics: [{ slug: "system-components", name: "System components and architecture", sortOrder: 1 }],
    },
    {
      slug: "social-implications",
      name: "Social implications of IT",
      sortOrder: 3,
      subtopics: [{ slug: "ethics-and-security", name: "Ethics, security and legal issues", sortOrder: 1 }],
    },
  ],

  "agricultural-sciences": [
    {
      slug: "animal-nutrition",
      name: "Animal nutrition",
      sortOrder: 1,
      subtopics: [
        { slug: "digestion-and-feed", name: "Digestion and feed components", sortOrder: 1 },
        { slug: "ration-formulation", name: "Ration formulation", sortOrder: 2 },
      ],
    },
    {
      slug: "animal-production",
      name: "Animal production",
      sortOrder: 2,
      subtopics: [{ slug: "production-systems", name: "Production systems and management", sortOrder: 1 }],
    },
    {
      slug: "soil-and-plant",
      name: "Soil and plant sciences",
      sortOrder: 3,
      subtopics: [
        { slug: "soil-fertility", name: "Soil fertility and management", sortOrder: 1 },
        { slug: "plant-growth", name: "Plant growth and reproduction", sortOrder: 2 },
      ],
    },
  ],

  "afrikaans-home-language": [
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
        { slug: "kritiese-lees", name: "Kritiese lees", sortOrder: 2 },
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

  "afrikaans-first-additional-language": [
    {
      slug: "taalstrukture-fal",
      name: "Taalstrukture",
      sortOrder: 1,
      subtopics: [
        { slug: "grammatika-basis", name: "Grammatika: werkwoorde en sinbou", sortOrder: 1 },
        { slug: "woordeskat-en-spelling", name: "Woordeskat en spelling", sortOrder: 2 },
      ],
    },
    {
      slug: "lees-fal",
      name: "Lees en begrip",
      sortOrder: 2,
      subtopics: [
        { slug: "kort-tekste", name: "Kort tekste en advertensies", sortOrder: 1 },
        { slug: "lang-tekste", name: "Langer tekste en opsomming", sortOrder: 2 },
      ],
    },
    {
      slug: "skryf-fal",
      name: "Skryf",
      sortOrder: 3,
      subtopics: [
        { slug: "informele-formele", name: "Informele en formele brief", sortOrder: 1 },
        { slug: "kreatiewe-skryf-fal", name: "Kreatiewe skryfwerk", sortOrder: 2 },
      ],
    },
  ],

  "religion-studies": [
    {
      slug: "world-religions",
      name: "World religions",
      sortOrder: 1,
      subtopics: [
        { slug: "beliefs-and-practices", name: "Beliefs and practices", sortOrder: 1 },
        { slug: "sacred-texts", name: "Sacred texts and interpretation", sortOrder: 2 },
      ],
    },
    {
      slug: "ethics-and-society",
      name: "Ethics and society",
      sortOrder: 2,
      subtopics: [
        { slug: "moral-decision-making", name: "Moral decision-making", sortOrder: 1 },
        { slug: "religion-and-social-issues", name: "Religion and contemporary issues", sortOrder: 2 },
      ],
    },
  ],

  "engineering-graphics-and-design": [
    {
      slug: "geometric-construction",
      name: "Geometric construction",
      sortOrder: 1,
      subtopics: [
        { slug: "orthographic-projection", name: "Orthographic projection", sortOrder: 1 },
        { slug: "isometric-and-oblique", name: "Isometric and oblique drawing", sortOrder: 2 },
      ],
    },
    {
      slug: "design-process",
      name: "Design process",
      sortOrder: 2,
      subtopics: [{ slug: "design-brief-and-solution", name: "Design brief and solution development", sortOrder: 1 }],
    },
  ],

  "electrical-technology": [
    {
      slug: "electrical-systems",
      name: "Electrical systems",
      sortOrder: 1,
      subtopics: [
        { slug: "circuit-principles", name: "Circuit principles", sortOrder: 1 },
        { slug: "electrical-machines", name: "Electrical machines and control", sortOrder: 2 },
      ],
    },
    {
      slug: "workshop-practice",
      name: "Workshop practice",
      sortOrder: 2,
      subtopics: [{ slug: "safety-and-tools", name: "Safety, tools and maintenance", sortOrder: 1 }],
    },
  ],

  "mechanical-technology": [
    {
      slug: "mechanical-systems",
      name: "Mechanical systems",
      sortOrder: 1,
      subtopics: [
        { slug: "tools-and-materials", name: "Tools and materials", sortOrder: 1 },
        { slug: "mechanisms", name: "Mechanisms and power transmission", sortOrder: 2 },
      ],
    },
    {
      slug: "workshop-practice",
      name: "Workshop practice",
      sortOrder: 2,
      subtopics: [{ slug: "safety-and-processes", name: "Safety and manufacturing processes", sortOrder: 1 }],
    },
  ],

  "civil-technology": [
    {
      slug: "construction-technology",
      name: "Construction technology",
      sortOrder: 1,
      subtopics: [
        { slug: "structures-and-services", name: "Structures and services", sortOrder: 1 },
        { slug: "materials-and-finishes", name: "Materials and finishes", sortOrder: 2 },
      ],
    },
    {
      slug: "workshop-practice",
      name: "Workshop practice",
      sortOrder: 2,
      subtopics: [{ slug: "site-safety", name: "Site safety and drawing conventions", sortOrder: 1 }],
    },
  ],

  "agricultural-management-practices": [
    {
      slug: "farm-management",
      name: "Farm management",
      sortOrder: 1,
      subtopics: [
        { slug: "planning-and-records", name: "Planning and records", sortOrder: 1 },
        { slug: "labour-and-marketing", name: "Labour relations and marketing", sortOrder: 2 },
      ],
    },
    {
      slug: "sustainability",
      name: "Sustainable agriculture",
      sortOrder: 2,
      subtopics: [{ slug: "resource-conservation", name: "Resource conservation", sortOrder: 1 }],
    },
  ],

  "agricultural-technology": [
    {
      slug: "agri-technology",
      name: "Agri-technology",
      sortOrder: 1,
      subtopics: [
        { slug: "tools-and-equipment", name: "Tools and equipment", sortOrder: 1 },
        { slug: "structures-and-water", name: "Farm structures and water systems", sortOrder: 2 },
      ],
    },
    {
      slug: "workshop-practice",
      name: "Workshop practice",
      sortOrder: 2,
      subtopics: [{ slug: "maintenance-and-safety", name: "Maintenance and safety", sortOrder: 1 }],
    },
  ],

  "visual-arts": [
    {
      slug: "art-making",
      name: "Art making",
      sortOrder: 1,
      subtopics: [
        { slug: "visual-literacy", name: "Visual literacy", sortOrder: 1 },
        { slug: "art-making-techniques", name: "Art-making techniques and media", sortOrder: 2 },
      ],
    },
    {
      slug: "art-history",
      name: "Art history and criticism",
      sortOrder: 2,
      subtopics: [{ slug: "analysis-and-context", name: "Analysis, context and meaning", sortOrder: 1 }],
    },
  ],

  "dramatic-arts": [
    {
      slug: "performance",
      name: "Performance",
      sortOrder: 1,
      subtopics: [
        { slug: "acting-and-interpretation", name: "Acting and interpretation", sortOrder: 1 },
        { slug: "voice-and-movement", name: "Voice and movement", sortOrder: 2 },
      ],
    },
    {
      slug: "theatre-studies",
      name: "Theatre studies",
      sortOrder: 2,
      subtopics: [{ slug: "genres-and-styles", name: "Theatre genres and styles", sortOrder: 1 }],
    },
  ],

  music: [
    {
      slug: "music-literacy",
      name: "Music literacy",
      sortOrder: 1,
      subtopics: [
        { slug: "theory-and-notation", name: "Theory and notation", sortOrder: 1 },
        { slug: "harmony-and-composition", name: "Harmony and composition basics", sortOrder: 2 },
      ],
    },
    {
      slug: "performance",
      name: "Performance",
      sortOrder: 2,
      subtopics: [{ slug: "performing-and-appraising", name: "Performing and appraising", sortOrder: 1 }],
    },
  ],

  "dance-studies": [
    {
      slug: "dance-performance",
      name: "Dance performance",
      sortOrder: 1,
      subtopics: [
        { slug: "choreography-basics", name: "Choreography basics", sortOrder: 1 },
        { slug: "technique-and-fitness", name: "Technique and fitness", sortOrder: 2 },
      ],
    },
    {
      slug: "dance-history",
      name: "Dance history and appreciation",
      sortOrder: 2,
      subtopics: [{ slug: "styles-and-context", name: "Dance styles and context", sortOrder: 1 }],
    },
  ],

  design: [
    {
      slug: "design-process",
      name: "Design process",
      sortOrder: 1,
      subtopics: [
        { slug: "brief-and-research", name: "Brief and research", sortOrder: 1 },
        { slug: "concept-development", name: "Concept development and presentation", sortOrder: 2 },
      ],
    },
    {
      slug: "design-fields",
      name: "Design fields",
      sortOrder: 2,
      subtopics: [{ slug: "graphic-and-product", name: "Graphic and product design principles", sortOrder: 1 }],
    },
  ],

  "hospitality-studies": [
    {
      slug: "hospitality-operations",
      name: "Hospitality operations",
      sortOrder: 1,
      subtopics: [
        { slug: "food-and-beverage-service", name: "Food and beverage service", sortOrder: 1 },
        { slug: "kitchen-operations", name: "Kitchen operations and hygiene", sortOrder: 2 },
      ],
    },
    {
      slug: "hospitality-management",
      name: "Hospitality management",
      sortOrder: 2,
      subtopics: [{ slug: "customer-service", name: "Customer service and entrepreneurship", sortOrder: 1 }],
    },
  ],

  "consumer-studies": [
    {
      slug: "consumer-rights",
      name: "Consumer rights",
      sortOrder: 1,
      subtopics: [
        { slug: "responsible-consumption", name: "Responsible consumption", sortOrder: 1 },
        { slug: "legislation-and-rights", name: "Consumer legislation and rights", sortOrder: 2 },
      ],
    },
    {
      slug: "food-and-nutrition",
      name: "Food and nutrition",
      sortOrder: 2,
      subtopics: [{ slug: "nutrition-and-meal-planning", name: "Nutrition and meal planning", sortOrder: 1 }],
    },
  ],

  "life-orientation": [
    {
      slug: "development-of-the-self",
      name: "Development of the self in society",
      sortOrder: 1,
      subtopics: [
        { slug: "career-and-study-skills", name: "Career and study skills", sortOrder: 1 },
        { slug: "identity-and-roles", name: "Identity, roles and responsibilities", sortOrder: 2 },
      ],
    },
    {
      slug: "health-social-and-environmental",
      name: "Health, social and environmental responsibility",
      sortOrder: 2,
      subtopics: [
        { slug: "health-and-wellbeing", name: "Health, wellbeing and lifestyle diseases", sortOrder: 1 },
        { slug: "social-and-environmental", name: "Social and environmental responsibility", sortOrder: 2 },
      ],
    },
    {
      slug: "democracy-and-citizenship",
      name: "Democracy and human rights",
      sortOrder: 3,
      subtopics: [{ slug: "citizenship-and-rights", name: "Citizenship, human rights and democracy", sortOrder: 1 }],
    },
  ],
};

const CAPS_HOME_LANGUAGE_TOPICS: CapsTopic[] = [
  {
    slug: "taalstrukture",
    name: "Taalstrukture en konvensies",
    sortOrder: 1,
    subtopics: [
      { slug: "grammatika-en-woordeskat", name: "Grammatika en woordeskat", sortOrder: 1 },
      { slug: "taal-en-styl", name: "Taal en styl", sortOrder: 2 },
    ],
  },
  {
    slug: "lees-en-kyk",
    name: "Lees en kyk",
    sortOrder: 2,
    subtopics: [
      { slug: "begrip-en-opsomming", name: "Begrip en opsomming", sortOrder: 1 },
      { slug: "kritiese-lees", name: "Kritiese lees en ontleding", sortOrder: 2 },
    ],
  },
  {
    slug: "skryf",
    name: "Skryf",
    sortOrder: 3,
    subtopics: [
      { slug: "transaksioneel-en-kreatief", name: "Transaksioneel en kreatief", sortOrder: 1 },
      { slug: "kreatiewe-skryfwerk", name: "Kreatiewe skryfwerk", sortOrder: 2 },
    ],
  },
  {
    slug: "letterkunde",
    name: "Letterkunde",
    sortOrder: 4,
    subtopics: [
      { slug: "poësie-en-prosa", name: "Poësie en prosa", sortOrder: 1 },
      { slug: "drama-en-film", name: "Drama en film", sortOrder: 2 },
    ],
  },
];

const CAPS_ADDITIONAL_LANGUAGE_TOPICS: CapsTopic[] = [
  {
    slug: "taalstrukture-fal",
    name: "Taalstrukture",
    sortOrder: 1,
    subtopics: [
      { slug: "grammatika-basis", name: "Grammar basics", sortOrder: 1 },
      { slug: "woordeskat-spelling", name: "Vocabulary and spelling", sortOrder: 2 },
    ],
  },
  {
    slug: "lees-fal",
    name: "Lees en begrip",
    sortOrder: 2,
    subtopics: [
      { slug: "kort-tekste", name: "Short texts", sortOrder: 1 },
      { slug: "lang-tekste", name: "Longer texts and summary", sortOrder: 2 },
    ],
  },
  {
    slug: "skryf-fal",
    name: "Skryf",
    sortOrder: 3,
    subtopics: [
      { slug: "informele-formele", name: "Informal and formal writing", sortOrder: 1 },
      { slug: "kreatiewe-skryf-fal", name: "Creative writing", sortOrder: 2 },
    ],
  },
];

const CAPS_ENGLISH_FAL_TOPICS: CapsTopic[] = [
  {
    slug: "language-structures-fal",
    name: "Language structures",
    sortOrder: 1,
    subtopics: [
      { slug: "grammatika-basis", name: "Grammar basics", sortOrder: 1 },
      { slug: "visual-literacy-fal", name: "Visual literacy", sortOrder: 2 },
    ],
  },
  {
    slug: "reading-fal",
    name: "Reading and comprehension",
    sortOrder: 2,
    subtopics: [
      { slug: "kort-tekste", name: "Short texts", sortOrder: 1 },
      { slug: "lang-tekste", name: "Longer texts", sortOrder: 2 },
    ],
  },
  {
    slug: "writing-fal",
    name: "Writing",
    sortOrder: 3,
    subtopics: [
      { slug: "informele-formele", name: "Informal and formal writing", sortOrder: 1 },
      { slug: "kreatiewe-skryf-fal", name: "Creative writing", sortOrder: 2 },
    ],
  },
];

const HL_LANGUAGE_SLUGS = [
  "isizulu-home-language",
  "isixhosa-home-language",
  "sepedi-home-language",
  "sesotho-home-language",
  "setswana-home-language",
  "siswati-home-language",
  "tshivenda-home-language",
  "xitsonga-home-language",
  "isindebele-home-language",
] as const;

const FAL_LANGUAGE_SLUGS = [
  "isizulu-first-additional-language",
  "isixhosa-first-additional-language",
  "sepedi-first-additional-language",
  "sesotho-first-additional-language",
  "setswana-first-additional-language",
  "siswati-first-additional-language",
  "tshivenda-first-additional-language",
  "xitsonga-first-additional-language",
  "isindebele-first-additional-language",
] as const;

for (const slug of HL_LANGUAGE_SLUGS) {
  CAPS_TOPICS_BY_SUBJECT[slug] = CAPS_HOME_LANGUAGE_TOPICS;
}
for (const slug of FAL_LANGUAGE_SLUGS) {
  CAPS_TOPICS_BY_SUBJECT[slug] = CAPS_ADDITIONAL_LANGUAGE_TOPICS;
}
CAPS_TOPICS_BY_SUBJECT["english-first-additional-language"] = CAPS_ENGLISH_FAL_TOPICS;

/** Subjects with a full CAPS assessment map (taxonomy complete for tracking). */
export const CAPS_ASSESSMENT_MAP_COMPLETE_SLUGS = new Set(Object.keys(CAPS_TOPICS_BY_SUBJECT));

export function capsTopicsForSubject(subjectSlug: string): CapsTopic[] | undefined {
  return CAPS_TOPICS_BY_SUBJECT[subjectSlug];
}
