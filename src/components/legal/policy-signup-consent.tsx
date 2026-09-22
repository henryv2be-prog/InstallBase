"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

interface PolicySignupConsentProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
}

export function PolicySignupConsent({ checked, onChange, error }: PolicySignupConsentProps) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-border bg-card/40 p-3 text-sm leading-snug">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={Boolean(error)}
        />
        <span>
          I have read and agree to the{" "}
          <Link href="/terms" className="font-medium text-blue-600 hover:underline dark:text-cyan-400" target="_blank">
            Terms of Use
          </Link>{" "}
          and{" "}
          <Link
            href="/community-guidelines"
            className="font-medium text-blue-600 hover:underline dark:text-cyan-400"
            target="_blank"
          >
            Community Guidelines
          </Link>
          , and acknowledge the{" "}
          <Link href="/privacy" className="font-medium text-blue-600 hover:underline dark:text-cyan-400" target="_blank">
            Privacy Policy
          </Link>
          ,{" "}
          <Link href="/content-policy" className="font-medium text-blue-600 hover:underline dark:text-cyan-400" target="_blank">
            Content Policy
          </Link>{" "}
          and{" "}
          <Link href="/cookies" className="font-medium text-blue-600 hover:underline dark:text-cyan-400" target="_blank">
            Cookie Policy
          </Link>
          .
        </span>
      </label>
      {error ? <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
    </div>
  );
}
