"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { POLICY_LABELS } from "@/lib/legal/policy-meta";
import type { PolicyType } from "@/generated/prisma/client";
import { lookupUserPolicyCompliance } from "@/lib/legal/admin-policy-actions";
import { toast } from "sonner";

interface ActivePolicyRow {
  policyType: PolicyType;
  version: string;
  effectiveAt: Date;
}

interface AdminPoliciesPanelProps {
  activePolicies: ActivePolicyRow[];
}

export function AdminPoliciesPanel({ activePolicies }: AdminPoliciesPanelProps) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState<Awaited<ReturnType<typeof lookupUserPolicyCompliance>> | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  const search = () => {
    startTransition(async () => {
      try {
        const data = await lookupUserPolicyCompliance(username.trim());
        setResult(data);
        if ("error" in data) toast.error(data.error);
      } catch {
        toast.error("Lookup failed");
      }
    });
  };

  return (
    <div className="space-y-8">
      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Active policy versions</h2>
        <p className="mt-1 text-sm text-muted">Users must accept these versions to use the platform.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {activePolicies.map((p) => (
            <li key={p.policyType} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
              <span className="font-medium">{POLICY_LABELS[p.policyType]}</span>
              <span className="text-muted">
                v{p.version} · effective {new Date(p.effectiveAt).toLocaleDateString("en-ZA")}
              </span>
            </li>
          ))}
          {activePolicies.length === 0 ? (
            <li className="text-muted">No active versions — run policy seed after migration.</li>
          ) : null}
        </ul>
      </section>

      <section className="glass-card rounded-2xl p-5">
        <h2 className="text-lg font-semibold">User compliance lookup</h2>
        <p className="mt-1 text-sm text-muted">Enter a username to view policy acceptance (moderator use only).</p>
        <div className="mt-4 flex gap-2">
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
            className="max-w-xs"
          />
          <Button type="button" onClick={search} disabled={pending || !username.trim()}>
            Look up
          </Button>
        </div>
        {result && !("error" in result) ? (
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">@{result.username}</span> ·{" "}
              {result.compliant ? (
                <span className="text-emerald-600 dark:text-emerald-400">Compliant</span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">Acceptance required</span>
              )}
            </p>
            <ul className="space-y-1 rounded-lg border border-border p-3">
              {result.items.map((item) => (
                <li key={item.policyType} className="flex flex-wrap justify-between gap-2">
                  <span>{POLICY_LABELS[item.policyType as PolicyType]}</span>
                  <span className="text-muted">
                    required v{item.requiredVersion ?? "—"} · accepted v{item.acceptedVersion ?? "—"}
                    {item.acceptedAt
                      ? ` · ${new Date(item.acceptedAt).toLocaleString("en-ZA")}`
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>
    </div>
  );
}
