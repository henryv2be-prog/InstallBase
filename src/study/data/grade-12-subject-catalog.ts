/**
 * Grade 12 NSC (CAPS FET) subject catalog for South African schools.
 * Subjects without a curriculum slice in curriculum-starter.ts are onboardable
 * but show "topics coming soon" until CAPS content is added.
 *
 * @see https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx
 */

export type Grade12SubjectCategory =
  | "core"
  | "commerce"
  | "humanities"
  | "languages"
  | "technology"
  | "agriculture"
  | "creative"
  | "services";

export type Grade12SubjectCatalogEntry = {
  slug: string;
  name: string;
  sortOrder: number;
  category: Grade12SubjectCategory;
};

export const GRADE_12_SUBJECT_CATEGORY_LABELS: Record<Grade12SubjectCategory, string> = {
  core: "Core & STEM",
  commerce: "Commerce & Economics",
  humanities: "Humanities",
  languages: "Languages",
  technology: "Technology & Engineering",
  agriculture: "Agricultural Sciences",
  creative: "Creative Arts",
  services: "Services & Life Skills",
};

/** Full NSC-oriented subject list for learner onboarding (2026 prototype). */
export const GRADE_12_NSC_SUBJECT_CATALOG: Grade12SubjectCatalogEntry[] = [
  // Core & STEM
  { slug: "mathematics", name: "Mathematics", sortOrder: 1, category: "core" },
  { slug: "mathematical-literacy", name: "Mathematical Literacy", sortOrder: 2, category: "core" },
  { slug: "physical-sciences", name: "Physical Sciences", sortOrder: 3, category: "core" },
  { slug: "life-sciences", name: "Life Sciences", sortOrder: 4, category: "core" },
  // Commerce
  { slug: "accounting", name: "Accounting", sortOrder: 10, category: "commerce" },
  { slug: "business-studies", name: "Business Studies", sortOrder: 11, category: "commerce" },
  { slug: "economics", name: "Economics", sortOrder: 12, category: "commerce" },
  // Humanities
  { slug: "geography", name: "Geography", sortOrder: 20, category: "humanities" },
  { slug: "history", name: "History", sortOrder: 21, category: "humanities" },
  { slug: "religion-studies", name: "Religion Studies", sortOrder: 22, category: "humanities" },
  // Languages — English & Afrikaans
  { slug: "english-home-language", name: "English Home Language", sortOrder: 30, category: "languages" },
  {
    slug: "english-first-additional-language",
    name: "English First Additional Language",
    sortOrder: 31,
    category: "languages",
  },
  { slug: "afrikaans-home-language", name: "Afrikaans Home Language", sortOrder: 32, category: "languages" },
  {
    slug: "afrikaans-first-additional-language",
    name: "Afrikaans First Additional Language",
    sortOrder: 33,
    category: "languages",
  },
  // Languages — African languages (HL / FAL pairs)
  { slug: "isizulu-home-language", name: "isiZulu Home Language", sortOrder: 40, category: "languages" },
  { slug: "isizulu-first-additional-language", name: "isiZulu First Additional Language", sortOrder: 41, category: "languages" },
  { slug: "isixhosa-home-language", name: "isiXhosa Home Language", sortOrder: 42, category: "languages" },
  { slug: "isixhosa-first-additional-language", name: "isiXhosa First Additional Language", sortOrder: 43, category: "languages" },
  { slug: "sepedi-home-language", name: "Sepedi Home Language", sortOrder: 44, category: "languages" },
  { slug: "sepedi-first-additional-language", name: "Sepedi First Additional Language", sortOrder: 45, category: "languages" },
  { slug: "sesotho-home-language", name: "Sesotho Home Language", sortOrder: 46, category: "languages" },
  { slug: "sesotho-first-additional-language", name: "Sesotho First Additional Language", sortOrder: 47, category: "languages" },
  { slug: "setswana-home-language", name: "Setswana Home Language", sortOrder: 48, category: "languages" },
  { slug: "setswana-first-additional-language", name: "Setswana First Additional Language", sortOrder: 49, category: "languages" },
  { slug: "siswati-home-language", name: "siSwati Home Language", sortOrder: 50, category: "languages" },
  { slug: "siswati-first-additional-language", name: "siSwati First Additional Language", sortOrder: 51, category: "languages" },
  { slug: "tshivenda-home-language", name: "Tshivenda Home Language", sortOrder: 52, category: "languages" },
  { slug: "tshivenda-first-additional-language", name: "Tshivenda First Additional Language", sortOrder: 53, category: "languages" },
  { slug: "xitsonga-home-language", name: "Xitsonga Home Language", sortOrder: 54, category: "languages" },
  { slug: "xitsonga-first-additional-language", name: "Xitsonga First Additional Language", sortOrder: 55, category: "languages" },
  { slug: "isindebele-home-language", name: "isiNdebele Home Language", sortOrder: 56, category: "languages" },
  { slug: "isindebele-first-additional-language", name: "isiNdebele First Additional Language", sortOrder: 57, category: "languages" },
  // Technology & Engineering
  { slug: "computer-applications-technology", name: "Computer Applications Technology (CAT)", sortOrder: 60, category: "technology" },
  { slug: "information-technology", name: "Information Technology (IT)", sortOrder: 61, category: "technology" },
  { slug: "engineering-graphics-and-design", name: "Engineering Graphics & Design (EGD)", sortOrder: 62, category: "technology" },
  { slug: "electrical-technology", name: "Electrical Technology", sortOrder: 63, category: "technology" },
  { slug: "mechanical-technology", name: "Mechanical Technology", sortOrder: 64, category: "technology" },
  { slug: "civil-technology", name: "Civil Technology", sortOrder: 65, category: "technology" },
  // Agriculture
  { slug: "agricultural-sciences", name: "Agricultural Sciences", sortOrder: 70, category: "agriculture" },
  { slug: "agricultural-management-practices", name: "Agricultural Management Practices", sortOrder: 71, category: "agriculture" },
  { slug: "agricultural-technology", name: "Agricultural Technology", sortOrder: 72, category: "agriculture" },
  // Creative Arts
  { slug: "visual-arts", name: "Visual Arts", sortOrder: 80, category: "creative" },
  { slug: "dramatic-arts", name: "Dramatic Arts", sortOrder: 81, category: "creative" },
  { slug: "music", name: "Music", sortOrder: 82, category: "creative" },
  { slug: "dance-studies", name: "Dance Studies", sortOrder: 83, category: "creative" },
  { slug: "design", name: "Design", sortOrder: 84, category: "creative" },
  // Services & other
  { slug: "tourism", name: "Tourism", sortOrder: 90, category: "services" },
  { slug: "hospitality-studies", name: "Hospitality Studies", sortOrder: 91, category: "services" },
  { slug: "consumer-studies", name: "Consumer Studies", sortOrder: 92, category: "services" },
  { slug: "life-orientation", name: "Life Orientation", sortOrder: 93, category: "services" },
];

export const GRADE_12_SUBJECT_BY_SLUG = Object.fromEntries(
  GRADE_12_NSC_SUBJECT_CATALOG.map((s) => [s.slug, s]),
) as Record<string, Grade12SubjectCatalogEntry>;
