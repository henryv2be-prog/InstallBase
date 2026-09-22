"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserPolicyComplianceSummary } from "@/lib/legal/compliance";

async function assertAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");
}

export async function lookupUserPolicyCompliance(username: string) {
  await assertAdmin();
  const normalized = username.replace(/^@/, "").trim().toLowerCase();
  if (!normalized) return { error: "Enter a username" as const };

  const profile = await prisma.profile.findUnique({
    where: { username: normalized },
    select: { userId: true, username: true },
  });
  if (!profile) return { error: "User not found" as const };

  const summary = await getUserPolicyComplianceSummary(profile.userId);
  return {
    username: profile.username,
    compliant: summary.compliant,
    items: summary.items,
  };
}
