"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requestPasswordResetAction } from "@/lib/actions";
import { toast } from "sonner";

export function ForgotPasswordForm() {
  const [pending, startTransition] = useTransition();
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await requestPasswordResetAction(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      setSent(true);
      toast.success("Check your email");
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password?</CardTitle>
        <p className="text-sm text-muted">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </CardHeader>
      <CardContent>
        {sent ? (
          <div className="space-y-4">
            <p className="rounded-xl border border-border bg-card/60 px-3 py-3 text-sm text-foreground/90">
              If an account exists with that email, we sent a reset link. It expires in 1 hour.
            </p>
            <Link href="/login" className="inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400">
              Back to log in
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                placeholder="you@company.com"
                className="text-base"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {error}
              </p>
            )}

            <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
              {pending ? "Sending..." : "Send reset link"}
            </Button>

            <div className="text-center text-sm text-muted">
              <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-cyan-400">
                Back to log in
              </Link>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
