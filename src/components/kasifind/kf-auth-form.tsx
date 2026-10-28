"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { kfRegisterProvider, kfSignInProvider } from "@/lib/kasifind/actions";

export function KfAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      className="kf-card space-y-3 rounded-2xl p-5"
      action={(formData) => {
        startTransition(async () => {
          const result =
            mode === "register" ? await kfRegisterProvider(formData) : await kfSignInProvider(formData);
          if ("error" in result && result.error) {
            setError(result.error);
            return;
          }
          router.push("/kasifind/account/listing");
          router.refresh();
        });
      }}
    >
      {mode === "register" && (
        <label className="block text-sm font-medium">
          Your name
          <input name="name" className="mt-1 w-full rounded-lg border px-3 py-2" autoComplete="name" />
        </label>
      )}
      <label className="block text-sm font-medium">
        Email
        <input
          name="email"
          type="email"
          required
          className="mt-1 w-full rounded-lg border px-3 py-2"
          autoComplete="email"
        />
      </label>
      <label className="block text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          className="mt-1 w-full rounded-lg border px-3 py-2"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
      </label>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="kf-btn-primary w-full rounded-xl py-3 disabled:opacity-60"
      >
        {pending ? "Please wait…" : mode === "register" ? "Create account" : "Sign in"}
      </button>
    </form>
  );
}
