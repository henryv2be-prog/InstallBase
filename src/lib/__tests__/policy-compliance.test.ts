import { describe, it } from "node:test";
import assert from "node:assert/strict";
import type { PolicyType } from "@/generated/prisma/client";

function isComplianceSatisfied(
  required: { policyType: PolicyType; version: string }[],
  accepted: Partial<Record<PolicyType, string>>
) {
  return required.every((policy) => accepted[policy.policyType] === policy.version);
}

describe("policy compliance", () => {
  const required = [
    { policyType: "TERMS" as PolicyType, version: "1.0" },
    { policyType: "PRIVACY" as PolicyType, version: "1.0" },
    { policyType: "COMMUNITY_GUIDELINES" as PolicyType, version: "1.0" },
    { policyType: "CONTENT_POLICY" as PolicyType, version: "1.0" },
    { policyType: "COOKIES" as PolicyType, version: "1.0" },
  ];

  it("treats user as compliant when all required versions match", () => {
    assert.equal(
      isComplianceSatisfied(required, {
        TERMS: "1.0",
        PRIVACY: "1.0",
        COMMUNITY_GUIDELINES: "1.0",
        CONTENT_POLICY: "1.0",
        COOKIES: "1.0",
      }),
      true
    );
  });

  it("requires re-acceptance when terms version changes", () => {
    assert.equal(
      isComplianceSatisfied(required, {
        TERMS: "1.0",
        PRIVACY: "1.0",
        COMMUNITY_GUIDELINES: "1.0",
        CONTENT_POLICY: "1.0",
        COOKIES: "1.0",
      }),
      true
    );
    assert.equal(
      isComplianceSatisfied([{ policyType: "TERMS", version: "1.1" }, ...required.slice(1)], {
        TERMS: "1.0",
        PRIVACY: "1.0",
        COMMUNITY_GUIDELINES: "1.0",
        CONTENT_POLICY: "1.0",
        COOKIES: "1.0",
      }),
      false
    );
  });

  it("treats missing acceptance as non-compliant", () => {
    assert.equal(isComplianceSatisfied(required, {}), false);
  });
});
