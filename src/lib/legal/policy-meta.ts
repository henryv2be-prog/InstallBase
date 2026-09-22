import type { PolicyType } from "@/generated/prisma/client";

/** Bump version strings when published policy content changes materially. */
export const POLICY_VERSIONS: Record<PolicyType, string> = {
  TERMS: "1.0",
  PRIVACY: "1.0",
  COMMUNITY_GUIDELINES: "1.0",
  CONTENT_POLICY: "1.0",
  COOKIES: "1.0",
};

/** Initial publication effective date (UTC). Update when publishing new versions. */
export const POLICY_EFFECTIVE_DATE = new Date("2026-09-22T00:00:00.000Z");

export const POLICY_ROUTES: Record<PolicyType, string> = {
  TERMS: "/terms",
  PRIVACY: "/privacy",
  COMMUNITY_GUIDELINES: "/community-guidelines",
  CONTENT_POLICY: "/content-policy",
  COOKIES: "/cookies",
};

export const POLICY_LABELS: Record<PolicyType, string> = {
  TERMS: "Terms of Use",
  PRIVACY: "Privacy Policy",
  COMMUNITY_GUIDELINES: "Community Guidelines",
  CONTENT_POLICY: "Content, Copyright & Takedown Policy",
  COOKIES: "Cookie Policy",
};

export const REQUIRED_POLICY_TYPES: PolicyType[] = [
  "TERMS",
  "PRIVACY",
  "COMMUNITY_GUIDELINES",
  "CONTENT_POLICY",
  "COOKIES",
];

export function policyContentHash(policyType: PolicyType, version: string): string {
  return `${policyType}:${version}`;
}
