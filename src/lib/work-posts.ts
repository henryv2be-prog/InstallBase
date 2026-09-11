import type { PostIntent, PostType } from "@/generated/prisma/client";
import { SPECIALTIES } from "@/lib/constants";

export const PORTFOLIO_INTENTS: PostIntent[] = ["PROJECT_INSTALLATION", "SERVICE_REPAIR"];

/** Intents users can pick in the composer today (marketplace intents stored for later phases). */
export const COMPOSER_POST_INTENTS: {
  value: PostIntent;
  label: string;
  description: string;
  portfolio: boolean;
}[] = [
  {
    value: "GENERAL",
    label: "General",
    description: "A normal social post",
    portfolio: false,
  },
  {
    value: "PROJECT_INSTALLATION",
    label: "Project / Installation",
    description: "Share completed installation work",
    portfolio: true,
  },
  {
    value: "SERVICE_REPAIR",
    label: "Service / Repair",
    description: "Maintenance, repair, or service call",
    portfolio: true,
  },
  {
    value: "PRODUCT_EQUIPMENT",
    label: "Product / Equipment",
    description: "Equipment showcase or product discussion",
    portfolio: false,
  },
  {
    value: "TRAINING_CERTIFICATION",
    label: "Training / Certification",
    description: "Courses, certs, or training milestones",
    portfolio: false,
  },
];

export type WorkDetails = {
  trade?: string;
  projectType?: string;
  deviceCount?: string;
  skills?: string[];
  equipmentNotes?: string;
};

export function parseWorkDetails(raw: unknown): WorkDetails {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  const source = raw as Record<string, unknown>;
  const skills = Array.isArray(source.skills)
    ? source.skills.map((item) => String(item).trim()).filter(Boolean)
    : undefined;

  return {
    trade: source.trade ? String(source.trade).trim() : undefined,
    projectType: source.projectType ? String(source.projectType).trim() : undefined,
    deviceCount: source.deviceCount ? String(source.deviceCount).trim() : undefined,
    skills: skills?.length ? skills : undefined,
    equipmentNotes: source.equipmentNotes ? String(source.equipmentNotes).trim() : undefined,
  };
}

export function compactWorkDetails(raw: WorkDetails): WorkDetails | null {
  const entries = Object.entries(raw).filter(([, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value && String(value).trim());
  });
  if (!entries.length) return null;
  return Object.fromEntries(entries) as WorkDetails;
}

export function isPortfolioIntent(intent: PostIntent): boolean {
  return PORTFOLIO_INTENTS.includes(intent);
}

export function isPortfolioPost(input: {
  type: PostType;
  postIntent: PostIntent;
  inPortfolio: boolean;
}): boolean {
  if (input.inPortfolio) return true;
  if (input.type === "PROJECT") return true;
  return isPortfolioIntent(input.postIntent);
}

export function resolveComposerIntent(
  type: PostType,
  requestedIntent: string | null | undefined
): PostIntent {
  if (requestedIntent && isValidPostIntent(requestedIntent)) {
    return requestedIntent;
  }
  if (type === "PROJECT") return "PROJECT_INSTALLATION";
  return "GENERAL";
}

export function shouldIncludeInPortfolio(type: PostType, intent: PostIntent): boolean {
  if (type === "PROJECT") return true;
  return isPortfolioIntent(intent);
}

export function getPostIntentLabel(intent: PostIntent): string | null {
  const match = COMPOSER_POST_INTENTS.find((item) => item.value === intent);
  return match?.label ?? null;
}

export function getPostTradeLabel(input: {
  categories?: { category: { name: string } }[];
  workDetails?: unknown;
}): string {
  const categoryName = input.categories?.[0]?.category.name;
  if (categoryName) return categoryName;

  const details = parseWorkDetails(input.workDetails);
  if (details.trade && SPECIALTIES.includes(details.trade as (typeof SPECIALTIES)[number])) {
    return details.trade;
  }
  if (details.trade) return details.trade;

  return "General Installation";
}

export function shouldShowPostLocation(input: {
  location?: string | null;
  showExactLocation: boolean;
  postIntent: PostIntent;
  type: PostType;
}): boolean {
  if (!input.location?.trim()) return false;
  if (input.showExactLocation) return true;
  if (input.type === "PROJECT" || isPortfolioIntent(input.postIntent)) return false;
  return true;
}

function isValidPostIntent(value: string): value is PostIntent {
  return COMPOSER_POST_INTENTS.some((item) => item.value === value);
}
