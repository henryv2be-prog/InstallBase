/** Plain-language “why practice this?” copy keyed by subject/topic/subtopic slugs. */
const NOTES: Record<string, { en: string; af: string }> = {
  "mathematics/calculus/differentiation": {
    en: "Differentiation is core Paper 1 marks — gradients, tangents, and rates of change show up every year.",
    af: "Differensiatierekening is kern P1-punte — gradiënte, raaklyne en tempo van verandering kom elke jaar terug.",
  },
  "mathematics/calculus/applications-of-derivatives": {
    en: "Max/min and word problems are favourite NSC questions — they test both calculus and reasoning.",
    af: "Maks/min en woordprobleme is gunsteling NSC-vrae — hulle toets calculus én redenering.",
  },
  "mathematics/trigonometry/trigonometric-equations": {
    en: "Trig equations are high-frequency on Paper 2 — master the general solution and the 0°–360° interval.",
    af: "Trig-vergelikings kom gereeld op P2 — ken die algemene oplossing en die 0°–360° interval.",
  },
  "mathematics/trigonometry/compound-angle-identities": {
    en: "Compound angles unlock proofs and simplify Paper 2 trig — learn the sin/cos sum and double-angle forms.",
    af: "Saamgestelde hoeke help met bewys en P2-trig — leer die sin/cos som- en dubbelhoek-vorms.",
  },
  "mathematics/algebra/quadratic-equations": {
    en: "Quadratics appear early on Paper 1 — factorising, the formula, and inequalities build your confidence.",
    af: "Kwadratiese vergelikings kom vroeg op P1 — factorisering, die formule en ongelykhede bou selfvertroue.",
  },
  "mathematics/algebra/simultaneous-equations": {
    en: "Linear and non-linear systems link algebra with functions — a common 6–8 mark block.",
    af: "Lineêre en nie-lineêre stelsels skakel algebra met funksies — tipies 6–8 punte.",
  },
  "mathematics/functions/transformations": {
    en: "Knowing shifts, stretches, and reflections saves time interpreting graphs in tests.",
    af: "Verskuiwings, rek en refleksies help jou grafieke vinniger in toets en eksamen lees.",
  },
  "mathematics/functions/inverses": {
    en: "Inverses connect graphs across y = x and show up with hyperbolas and restricted domains.",
    af: "Inverses verbind grafieke oor y = x en kom voor met hyperbols en beperkte definieerverdomeine.",
  },
};

export function getSubtopicCoachNote(
  locale: "en" | "af",
  subjectSlug: string,
  topicSlug: string,
  subtopicSlug: string,
): string | null {
  const key = `${subjectSlug}/${topicSlug}/${subtopicSlug}`;
  const row = NOTES[key];
  if (!row) {
    return locale === "af"
      ? "Elke sessie bou muscle memory vir hierdie CAPS-onderwerp — doen 'n paar vrae gereeld."
      : "Each session builds exam muscle memory for this CAPS subtopic — a few questions often beats one long cram.";
  }
  return locale === "af" ? row.af : row.en;
}
