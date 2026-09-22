import type { PrismaClient } from "../src/generated/prisma/client";
import {
  POLICY_EFFECTIVE_DATE,
  POLICY_VERSIONS,
  policyContentHash,
} from "../src/lib/legal/policy-meta";
import type { PolicyType } from "../src/generated/prisma/client";

export async function seedPolicyVersions(prisma: PrismaClient) {
  const types = Object.keys(POLICY_VERSIONS) as PolicyType[];

  for (const policyType of types) {
    const version = POLICY_VERSIONS[policyType];
    await prisma.policyVersion.upsert({
      where: {
        policyType_version: { policyType, version },
      },
      create: {
        policyType,
        version,
        effectiveAt: POLICY_EFFECTIVE_DATE,
        contentHash: policyContentHash(policyType, version),
        active: true,
      },
      update: {
        effectiveAt: POLICY_EFFECTIVE_DATE,
        contentHash: policyContentHash(policyType, version),
        active: true,
      },
    });
  }

  // Deactivate older versions for each type
  for (const policyType of types) {
    const current = POLICY_VERSIONS[policyType];
    await prisma.policyVersion.updateMany({
      where: { policyType, NOT: { version: current } },
      data: { active: false },
    });
  }
}
