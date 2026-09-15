import type { PlatformRole } from "@/generated/prisma/client";

/** User-facing purpose options mapped to internal platform roles. */
export const PLATFORM_PURPOSES = [
  {
    id: "show_work",
    role: "PROFESSIONAL" as const,
    emoji: "👷",
    title: "Show my work",
    description: "I work in the industry and want to build my professional profile.",
  },
  {
    id: "find_work",
    role: "SEEKING_WORK" as const,
    emoji: "💼",
    title: "Find work",
    description: "I'm looking for employment, contract or subcontract work.",
  },
  {
    id: "company_rep",
    role: "COMPANY_REP" as const,
    emoji: "🏢",
    title: "Represent a company",
    description: "I represent or run an installation/business/company.",
  },
  {
    id: "hire",
    role: "EMPLOYER" as const,
    emoji: "🔎",
    title: "Hire professionals",
    description: "I'm looking for people to employ or subcontract.",
  },
  {
    id: "find_pro",
    role: "CUSTOMER" as const,
    emoji: "🛠️",
    title: "Find a professional",
    description: "I'm looking for someone to do installation or technical work.",
  },
] as const;

export type PlatformPurposeId = (typeof PLATFORM_PURPOSES)[number]["id"];

const purposeById = new Map(PLATFORM_PURPOSES.map((purpose) => [purpose.id, purpose]));
const purposeIdsByRole = new Map<PlatformRole, PlatformPurposeId[]>(
  PLATFORM_PURPOSES.reduce((acc, purpose) => {
    const existing = acc.get(purpose.role) ?? [];
    existing.push(purpose.id);
    acc.set(purpose.role, existing);
    return acc;
  }, new Map<PlatformRole, PlatformPurposeId[]>())
);

export function purposeIdsToRoles(purposeIds: string[]): PlatformRole[] {
  const roles = new Set<PlatformRole>();
  for (const id of purposeIds) {
    const purpose = purposeById.get(id as PlatformPurposeId);
    if (purpose) roles.add(purpose.role);
  }
  return [...roles];
}

export function rolesToPurposeIds(roles: PlatformRole[]): PlatformPurposeId[] {
  const ids = new Set<PlatformPurposeId>();
  for (const role of roles) {
    for (const id of purposeIdsByRole.get(role) ?? []) {
      ids.add(id);
    }
  }
  return [...ids];
}

/** Experience, specialties, and location are relevant for these purposes. */
export function needsProfessionalDetails(roles: PlatformRole[]): boolean {
  return roles.includes("PROFESSIONAL") || roles.includes("SEEKING_WORK");
}

export function getPurposeLabel(purposeId: PlatformPurposeId): string {
  return purposeById.get(purposeId)?.title ?? purposeId;
}

export function getWelcomeMessage(roles: PlatformRole[]): string {
  if (roles.length === 0) {
    return "Welcome to InstallBase. Browse the feed, follow professionals, and join the conversation.";
  }

  const messages: string[] = [];

  if (roles.includes("PROFESSIONAL")) {
    messages.push("Start sharing the work you're doing and connect with other professionals.");
  }
  if (roles.includes("SEEKING_WORK")) {
    messages.push("Your work and activity can help companies discover what you can do.");
  }
  if (roles.includes("COMPANY_REP")) {
    messages.push("Build your company presence and connect with professionals.");
  }
  if (roles.includes("EMPLOYER")) {
    messages.push("When you're ready, you'll be able to find professionals based on their actual work.");
  }
  if (roles.includes("CUSTOMER")) {
    messages.push("Use InstallBase to discover professionals and companies when you need installation work.");
  }

  if (messages.length === 1) return messages[0];
  if (messages.length === 2) return `${messages[0]} ${messages[1]}`;
  return `Welcome to InstallBase. ${messages.slice(0, 2).join(" ")}`;
}
