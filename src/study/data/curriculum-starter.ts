/**
 * CAPS FET Grade 12 assessment taxonomy for mastery tracking and recommendations.
 * Not a teaching syllabus — subtopics define what can be assessed and tracked.
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

import { capsTopicsForSubject } from "./caps-grade12-assessment-map";
import { GRADE_12_CURRICULUM_STARTER_EXTRA } from "./curriculum-starter-extra";

const CAPS_ASSESSMENT_VERSION = "2026 CAPS assessment map";

/** Grade 12 subjects with topic/subtopic trees for assessment and tracking. */
export const GRADE_12_CURRICULUM_STARTER: StudyCurriculumStarterSubject[] = [
  {
    slug: "mathematics",
    name: "Mathematics",
    sortOrder: 1,
    description: "Grade 12 Mathematics (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Mathematics FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICS%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("mathematics")!,
  },
  {
    slug: "mathematical-literacy",
    name: "Mathematical Literacy",
    sortOrder: 2,
    description: "Grade 12 Mathematical Literacy (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Mathematical Literacy FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20MATHEMATICAL%20LITERACY%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("mathematical-literacy")!,
  },
  {
    slug: "physical-sciences",
    name: "Physical Sciences",
    sortOrder: 3,
    description: "Grade 12 Physical Sciences (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Physical Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20PHYSICAL%20SCIENCES%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("physical-sciences")!,
  },
  {
    slug: "life-sciences",
    name: "Life Sciences",
    sortOrder: 4,
    description: "Grade 12 Life Sciences (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Life Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Portals/0/CD/National%20Curriculum%20Statements%20and%20Vocational/CAPS%20FET%20_%20LIFE%20SCIENCES%20_%20GR%2010-12%20_%20Web.pdf",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("life-sciences")!,
  },
  {
    slug: "accounting",
    name: "Accounting",
    sortOrder: 10,
    description: "Grade 12 Accounting (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Accounting FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("accounting")!,
  },
  {
    slug: "business-studies",
    name: "Business Studies",
    sortOrder: 11,
    description: "Grade 12 Business Studies (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Business Studies FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("business-studies")!,
  },
  {
    slug: "economics",
    name: "Economics",
    sortOrder: 12,
    description: "Grade 12 Economics (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Economics FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("economics")!,
  },
  {
    slug: "geography",
    name: "Geography",
    sortOrder: 20,
    description: "Grade 12 Geography (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Geography FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("geography")!,
  },
  {
    slug: "history",
    name: "History",
    sortOrder: 21,
    description: "Grade 12 History (CAPS FET) — full assessment map",
    sourceTitle: "CAPS History FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("history")!,
  },
  {
    slug: "english-home-language",
    name: "English Home Language",
    sortOrder: 30,
    description: "Grade 12 English HL (CAPS FET) — full assessment map",
    sourceTitle: "CAPS English Home Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("english-home-language")!,
  },
  {
    slug: "afrikaans-home-language",
    name: "Afrikaans Home Language",
    sortOrder: 32,
    description: "Grade 12 Afrikaans Huistaal (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Afrikaans Home Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("afrikaans-home-language")!,
  },
  {
    slug: "afrikaans-first-additional-language",
    name: "Afrikaans First Additional Language",
    sortOrder: 33,
    description: "Grade 12 Afrikaans Eerste Addisionele Taal (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Afrikaans First Additional Language FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("afrikaans-first-additional-language")!,
  },
  {
    slug: "tourism",
    name: "Tourism",
    sortOrder: 90,
    description: "Grade 12 Tourism (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Tourism FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("tourism")!,
  },
  {
    slug: "computer-applications-technology",
    name: "Computer Applications Technology (CAT)",
    sortOrder: 60,
    description: "Grade 12 CAT (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Computer Applications Technology FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("computer-applications-technology")!,
  },
  {
    slug: "information-technology",
    name: "Information Technology (IT)",
    sortOrder: 61,
    description: "Grade 12 IT (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Information Technology FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("information-technology")!,
  },
  {
    slug: "agricultural-sciences",
    name: "Agricultural Sciences",
    sortOrder: 70,
    description: "Grade 12 Agricultural Sciences (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Agricultural Sciences FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("agricultural-sciences")!,
  },
  {
    slug: "life-orientation",
    name: "Life Orientation",
    sortOrder: 93,
    description: "Grade 12 Life Orientation (CAPS FET) — full assessment map",
    sourceTitle: "CAPS Life Orientation FET (Grades 10–12)",
    sourceUrl:
      "https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS)/CAPSFET.aspx",
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopicsForSubject("life-orientation")!,
  },
  ...(
    GRADE_12_CURRICULUM_STARTER_EXTRA as unknown as StudyCurriculumStarterSubject[]
  ).map(applyCapsAssessmentMap),
];

function applyCapsAssessmentMap(subject: StudyCurriculumStarterSubject): StudyCurriculumStarterSubject {
  const capsTopics = capsTopicsForSubject(subject.slug);
  if (!capsTopics) return subject;
  return {
    ...subject,
    description: `Grade 12 ${subject.name} (CAPS FET) — full assessment map`,
    versionLabel: CAPS_ASSESSMENT_VERSION,
    topics: capsTopics,
  };
}
