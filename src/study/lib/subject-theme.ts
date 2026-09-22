/** Visual identity per NSC subject slug — used for accents, not rainbow UI. */

export type SubjectTheme = {
  slug: string;
  accent: string;
  accentSoft: string;
  glyph: string;
  label: string;
};

const DEFAULT: SubjectTheme = {
  slug: "default",
  accent: "#94a3b8",
  accentSoft: "rgba(148, 163, 184, 0.15)",
  glyph: "📘",
  label: "Subject",
};

const THEMES: Record<string, Omit<SubjectTheme, "slug">> = {
  mathematics: { accent: "#38bdf8", accentSoft: "rgba(56, 189, 248, 0.2)", glyph: "🧮", label: "Maths" },
  "mathematical-literacy": {
    accent: "#22d3ee",
    accentSoft: "rgba(34, 211, 238, 0.18)",
    glyph: "📊",
    label: "Math Lit",
  },
  "physical-sciences": {
    accent: "#a78bfa",
    accentSoft: "rgba(167, 139, 250, 0.2)",
    glyph: "⚛️",
    label: "Physical Sciences",
  },
  "life-sciences": {
    accent: "#4ade80",
    accentSoft: "rgba(74, 222, 128, 0.18)",
    glyph: "🧬",
    label: "Life Sciences",
  },
  "english-home-language": {
    accent: "#fb7185",
    accentSoft: "rgba(251, 113, 133, 0.18)",
    glyph: "📖",
    label: "English HL",
  },
  "english-first-additional-language": {
    accent: "#f472b6",
    accentSoft: "rgba(244, 114, 182, 0.18)",
    glyph: "📖",
    label: "English FAL",
  },
  "afrikaans-home-language": {
    accent: "#7dd3fc",
    accentSoft: "rgba(125, 211, 252, 0.16)",
    glyph: "📚",
    label: "Afrikaans HT",
  },
  "afrikaans-first-additional-language": {
    accent: "#94a3b8",
    accentSoft: "rgba(148, 163, 184, 0.16)",
    glyph: "📚",
    label: "Afrikaans EAT",
  },
  accounting: { accent: "#34d399", accentSoft: "rgba(52, 211, 153, 0.18)", glyph: "💼", label: "Accounting" },
  "business-studies": {
    accent: "#2dd4bf",
    accentSoft: "rgba(45, 212, 191, 0.18)",
    glyph: "📈",
    label: "Business Studies",
  },
  economics: { accent: "#fde68a", accentSoft: "rgba(253, 230, 138, 0.12)", glyph: "💹", label: "Economics" },
  geography: { accent: "#60a5fa", accentSoft: "rgba(96, 165, 250, 0.18)", glyph: "🌍", label: "Geography" },
  history: { accent: "#c084fc", accentSoft: "rgba(192, 132, 252, 0.18)", glyph: "🏛️", label: "History" },
  "computer-applications-technology": {
    accent: "#818cf8",
    accentSoft: "rgba(129, 140, 248, 0.2)",
    glyph: "💻",
    label: "CAT",
  },
};

export function getSubjectTheme(slug: string): SubjectTheme {
  const row = THEMES[slug];
  if (!row) return { ...DEFAULT, slug };
  return { slug, ...row };
}

export function masteryBand(pct: number): "strong" | "building" | "focus" {
  if (pct >= 75) return "strong";
  if (pct >= 50) return "building";
  return "focus";
}

export function masteryBandLabel(pct: number): string {
  const band = masteryBand(pct);
  if (band === "strong") return "You're getting there";
  if (band === "building") return "Keep going";
  return "Needs some work";
}

export function masteryBandEmoji(pct: number): string {
  const band = masteryBand(pct);
  if (band === "strong") return "🟢";
  if (band === "building") return "🟡";
  return "🔴";
}
