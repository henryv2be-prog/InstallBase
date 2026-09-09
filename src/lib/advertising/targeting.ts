import type { TargetingContext, TargetingRules } from "./types";

export function parseTargetingRules(raw: unknown): TargetingRules {
  if (!raw || typeof raw !== "object") return {};
  const rules = raw as Record<string, unknown>;
  const pickStrings = (key: string) => {
    const value = rules[key];
    if (!Array.isArray(value)) return undefined;
    return value.filter((item): item is string => typeof item === "string");
  };
  return {
    professions: pickStrings("professions"),
    trades: pickStrings("trades"),
    countries: pickStrings("countries"),
    regions: pickStrings("regions"),
    skills: pickStrings("skills"),
    interests: pickStrings("interests"),
    equipmentCategories: pickStrings("equipmentCategories"),
    companyTypes: pickStrings("companyTypes"),
    userTypes: pickStrings("userTypes"),
  };
}

function matchesList(values: string[] | undefined, candidate?: string) {
  if (!values?.length) return true;
  if (!candidate) return false;
  const lower = candidate.toLowerCase();
  return values.some((v) => v.toLowerCase() === lower);
}

function matchesAny(values: string[] | undefined, candidates: string[]) {
  if (!values?.length) return true;
  if (!candidates.length) return false;
  const set = new Set(values.map((v) => v.toLowerCase()));
  return candidates.some((c) => set.has(c.toLowerCase()));
}

/** Returns true when the ad's targeting rules match the viewer context. */
export function matchesTargeting(rules: TargetingRules, context: TargetingContext): boolean {
  if (!matchesList(rules.countries, context.country)) return false;
  if (!matchesList(rules.regions, context.city)) return false;
  if (!matchesList(rules.companyTypes, context.companyType)) return false;
  if (!matchesList(rules.userTypes, context.userType)) return false;
  if (!matchesAny(rules.trades, context.specialties ?? [])) return false;
  if (!matchesAny(rules.professions, context.specialties ?? [])) return false;
  if (!matchesAny(rules.skills, context.specialties ?? [])) return false;
  if (!matchesAny(rules.interests, context.specialties ?? [])) return false;
  return true;
}
