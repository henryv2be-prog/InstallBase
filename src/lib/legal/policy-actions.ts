"use server";

import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { REQUIRED_POLICY_TYPES } from "@/lib/legal/policy-meta";
import { isUserPolicyCompliant } from "@/lib/legal/compliance";

async function requestMeta() {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ipAddress = forwarded?.split(",")[0]?.trim() || h.get("x-real-ip") || null;
  const userAgent = h.get("user-agent")?.slice(0, 512) ?? null;
  return { ipAddress, userAgent };
}

export async function acceptCurrentPolicies(confirmed: boolean) {
  if (!confirmed) {
    return { error: "Please confirm that you have read and agree to the policies." };
  }

  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in to accept policies." };
  }
  const userId = session.user.id;
  const active = await prisma.policyVersion.findMany({
    where: { active: true, policyType: { in: REQUIRED_POLICY_TYPES } },
  });

  if (active.length !== REQUIRED_POLICY_TYPES.length) {
    return { error: "Policy versions are not fully configured. Please try again later." };
  }

  const { ipAddress, userAgent } = await requestMeta();
  const acceptedAt = new Date();

  await prisma.$transaction(
    active.map((policy) =>
      prisma.userPolicyAcceptance.create({
        data: {
          userId,
          policyType: policy.policyType,
          policyVersion: policy.version,
          policyVersionId: policy.id,
          acceptedAt,
          ipAddress,
          userAgent,
        },
      })
    )
  );

  return { success: true };
}

/** Called from registration after user is created — same validation as acceptCurrentPolicies. */
export async function recordPolicyAcceptanceForUser(userId: string) {
  const active = await prisma.policyVersion.findMany({
    where: { active: true, policyType: { in: REQUIRED_POLICY_TYPES } },
  });
  if (active.length !== REQUIRED_POLICY_TYPES.length) {
    throw new Error("Active policy versions missing");
  }
  const { ipAddress, userAgent } = await requestMeta();
  const acceptedAt = new Date();
  await prisma.$transaction(
    active.map((policy) =>
      prisma.userPolicyAcceptance.create({
        data: {
          userId,
          policyType: policy.policyType,
          policyVersion: policy.version,
          policyVersionId: policy.id,
          acceptedAt,
          ipAddress,
          userAgent,
        },
      })
    )
  );
}

export async function requirePolicyCompliance(userId: string) {
  const ok = await isUserPolicyCompliant(userId);
  if (!ok) {
    throw new Error("POLICY_ACCEPTANCE_REQUIRED");
  }
}
