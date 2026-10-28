"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";
import { kfRegisterProvider, kfSignInProvider } from "@/lib/kasifind/actions";
import { useKfToast } from "@/components/kasifind/kf-toast";

export function KfAuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const toast = useKfToast();

  return (
    <form
      className="kf-card space-y-4 p-6 shadow-[var(--kf-shadow-md)] kf-animate-in"
      action={(formData) => {
        startTransition(async () => {
          const result =
            mode === "register" ? await kfRegisterProvider(formData) : await kfSignInProvider(formData);
          if ("error" in result && result.error) {
            toast.error(result.error);
            return;
          }
          router.push("/account/listing");
          router.refresh();
        });
      }}
    >
      {mode === "register" && (
        <div>
          <label className="kf-label" htmlFor="kf-name">
            Your name
          </label>
          <input id="kf-name" name="name" className="kf-input" autoComplete="name" />
        </div>
      )}
      <div>
        <label className="kf-label" htmlFor="kf-email">
          Email
        </label>
        <input
          id="kf-email"
          name="email"
          type="email"
          required
          className="kf-input"
          autoComplete="email"
        />
      </div>
      <div>
        <label className="kf-label" htmlFor="kf-password">
          Password
        </label>
        <input
          id="kf-password"
          name="password"
          type="password"
          required
          minLength={8}
          className="kf-input"
          autoComplete={mode === "register" ? "new-password" : "current-password"}
        />
        <p className="kf-help">At least 8 characters.</p>
      </div>
      <button type="submit" disabled={pending} className="kf-btn kf-btn-primary w-full">
        {pending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Please wait…
          </>
        ) : mode === "register" ? (
          "Create account"
        ) : (
          "Sign in"
        )}
      </button>
    </form>
  );
}
