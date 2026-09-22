"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { acceptCurrentPolicies } from "@/lib/legal/policy-actions";
import { safeAuthNext } from "@/lib/auth-urls";
import { toast } from "sonner";
import { LogoutButton } from "@/components/auth/logout-button";

const policyLinks = [
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/community-guidelines", label: "Community Guidelines" },
  { href: "/content-policy", label: "Content, Copyright & Takedown Policy" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

export function PolicyAcceptanceForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = safeAuthNext(searchParams.get("next") ?? "/feed");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    startTransition(async () => {
      const result = await acceptCurrentPolicies(confirmed);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Thank you — you can continue using InstallBase.");
      router.replace(next);
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Updated policies</h1>
        <p className="mt-2 text-muted">
          InstallBase has updated its Terms and Community Policies. Please review and accept them to
          continue using InstallBase.
        </p>
      </div>

      <ul className="space-y-2 rounded-xl border border-border bg-card/60 p-4 text-sm">
        {policyLinks.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="font-medium text-blue-600 hover:underline dark:text-cyan-400">
              {label}
            </Link>
          </li>
        ))}
      </ul>

      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card/40 p-4 text-sm leading-snug">
        <input
          type="checkbox"
          className="mt-1 h-4 w-4 shrink-0 rounded border-border"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
        />
        <span>
          I have read and agree to the InstallBase Terms of Use and Community Guidelines, and
          acknowledge the Privacy Policy, Content Policy and Cookie Policy.
        </span>
      </label>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Button type="button" className="min-h-11 flex-1" disabled={!confirmed || pending} onClick={submit}>
          {pending ? "Saving…" : "Accept and continue"}
        </Button>
        <LogoutButton />
      </div>
    </div>
  );
}
