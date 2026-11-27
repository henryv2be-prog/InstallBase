/** Fold text for substring matching (case, apostrophes, light punctuation). */
export function foldSearchText(value: string): string {
  return value
    .toLowerCase()
    .replace(/[''`]/g, "")
    .replace(/[^\p{L}\p{N}\s]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const TRADE_WORD_VARIANTS: Record<string, string[]> = {
  plumbing: ["plumber", "plumbers"],
  plumber: ["plumbing", "plumbers"],
  welding: ["welder", "welders", "weld"],
  welder: ["welding", "welders", "weld"],
  repair: ["repairs", "repairing"],
  repairs: ["repair", "repairing"],
  aluminium: ["aluminum"],
  aluminum: ["aluminium"],
};

/** Singular/plural variants for a single token (conservative). */
export function pluralVariants(token: string): string[] {
  const base = token.trim().toLowerCase();
  if (base.length < 2) return [base];

  const variants = new Set<string>([base]);
  const trade = TRADE_WORD_VARIANTS[base];
  if (trade) trade.forEach((t) => variants.add(t));

  if (base.endsWith("ies") && base.length > 4) {
    variants.add(`${base.slice(0, -3)}y`);
  } else if (base.endsWith("es") && base.length > 3) {
    const minusTwo = base.slice(0, -2);
    const minusOne = base.slice(0, -1);
    // gate(s): singular is …e+s — do not also emit "gat" from stripping "es".
    if (minusOne.endsWith("e") && `${minusTwo}e` === minusOne) {
      variants.add(minusOne);
    } else {
      if (minusTwo.length >= 3) variants.add(minusTwo);
      if (minusOne.length >= 3 && minusOne !== minusTwo) variants.add(minusOne);
    }
  } else if (base.endsWith("s") && !base.endsWith("ss") && base.length > 3) {
    variants.add(base.slice(0, -1));
  } else if (!base.endsWith("s")) {
    variants.add(`${base}s`);
    if (base.endsWith("y") && base.length > 2) {
      variants.add(`${base.slice(0, -1)}ies`);
    }
  }

  return [...variants].filter((v) => v.length >= 1);
}

/** Query tokens after trim/split; keeps 1-character tokens (narrow matches). */
export function tokenizeSearchQuery(query: string): string[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  return trimmed
    .split(/[\s,/+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length >= 1)
    .map((t) => t.toLowerCase());
}

/** All substring needles to try for one token (normalisation + plurals). */
const MIN_SUBSTRING_NEEDLE_LEN = 4;

export function searchNeedlesForToken(token: string): string[] {
  const tokenLen = token.trim().length;
  const minLen =
    tokenLen <= MIN_SUBSTRING_NEEDLE_LEN
      ? 1
      : Math.min(MIN_SUBSTRING_NEEDLE_LEN, tokenLen - 1);
  const needles = new Set<string>();
  for (const variant of pluralVariants(token)) {
    if (variant.length < minLen) continue;
    const folded = foldSearchText(variant);
    if (folded.length >= minLen) needles.add(folded);
    needles.add(variant);
  }
  return [...needles].filter((n) => n.length >= minLen);
}

export function foldedFieldIncludes(field: string, needle: string): boolean {
  const hay = foldSearchText(field);
  const n = foldSearchText(needle);
  if (!n) return false;
  return hay.includes(n);
}
