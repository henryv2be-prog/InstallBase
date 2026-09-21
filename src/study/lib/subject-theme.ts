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
  accent: "#f97316",
  accentSoft: "rgba(249, 115, 22, 0.18)",
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
    accent: "#fbbf24",
    accentSoft: "rgba(251, 191, 36, 0.18)",
    glyph: "📚",
    label: "Afrikaans HT",
  },
  "afrikaans-first-additional-language": {
    accent: "#f59e0b",
    accentSoft: "rgba(245, 158, 11, 0.18)",
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
  economics: { accent: "#fcd34d", accentSoft: "rgba(252, 211, 77, 0.15)", glyph: "💹", label: "Economics" },
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
