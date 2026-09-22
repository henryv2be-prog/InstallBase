import { prisma } from "@/lib/prisma";
import type { PolicyType } from "@/generated/prisma/client";
import { REQUIRED_POLICY_TYPES } from "@/lib/legal/policy-meta";

export async function getActivePolicyVersions() {
  return prisma.policyVersion.findMany({
    where: { active: true },
    orderBy: { policyType: "asc" },
  });
}

export async function getLatestAcceptancesByUser(userId: string) {
  const rows = await prisma.userPolicyAcceptance.findMany({
    where: { userId },
    orderBy: { acceptedAt: "desc" },
  });
  const latest = new Map<PolicyType, (typeof rows)[number]>();
  for (const row of rows) {
    if (!latest.has(row.policyType)) latest.set(row.policyType, row);
  }
  return latest;
}

export async function isUserPolicyCompliant(userId: string): Promise<boolean> {
  const active = await getActivePolicyVersions();
  if (active.length === 0) return true;
  const required = active.filter((v) => REQUIRED_POLICY_TYPES.includes(v.policyType));
  if (required.length === 0) return true;

  const latest = await getLatestAcceptancesByUser(userId);
  return required.every((policy) => {
    const acceptance = latest.get(policy.policyType);
    return acceptance?.policyVersion === policy.version;
  });
}

export async function getUserPolicyComplianceSummary(userId: string) {
  const active = await getActivePolicyVersions();
  const latest = await getLatestAcceptancesByUser(userId);
  const items = REQUIRED_POLICY_TYPES.map((type) => {
    const activeVersion = active.find((p) => p.policyType === type);
    const acceptance = latest.get(type);
    const compliant =
      Boolean(activeVersion) &&
      acceptance?.policyVersion === activeVersion?.version;
    return {
      policyType: type,
      requiredVersion: activeVersion?.version ?? null,
      acceptedVersion: acceptance?.policyVersion ?? null,
      acceptedAt: acceptance?.acceptedAt ?? null,
      compliant,
    };
  });
  return {
    compliant: items.every((i) => i.compliant || !i.requiredVersion),
    items,
  };
}
