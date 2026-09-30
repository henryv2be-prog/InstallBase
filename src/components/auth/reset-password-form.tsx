"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { resetPasswordAction } from "@/lib/actions";
import { toast } from "sonner";

export function ResetPasswordForm({ token: tokenFromRoute }: { token: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tokenFromQuery = searchParams.get("token")?.trim() ?? "";
  const token = (tokenFromRoute || tokenFromQuery).trim();

  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    const submittedToken = (formData.get("token") as string | null)?.trim() || token;
    formData.set("token", submittedToken);

    startTransition(async () => {
      const result = await resetPasswordAction(formData);
      if (result.error) {
        setError(result.error);
        toast.error(result.error);
        return;
      }
      toast.success("Password updated — you can log in now");
      router.push("/login");
    });
  };

  if (!token) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-sm text-muted">This reset link is invalid. Request a new one.</p>
          <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-cyan-400">
            Request reset link
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <p className="text-sm text-muted">Use at least 8 characters.</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="hidden" name="token" value={token} readOnly />
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium">
              New password
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              placeholder="••••••••"
              className="text-base"
            />
          </div>

          {error && (
            <div className="space-y-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              <p>{error}</p>
              <Link
                href="/forgot-password"
                className="inline-block font-semibold text-blue-700 underline dark:text-cyan-300"
              >
                Request a new reset link
              </Link>
            </div>
          )}

          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            {pending ? "Updating..." : "Update password"}
          </Button>

          <div className="text-center text-sm text-muted">
            <Link href="/login" className="font-semibold text-blue-600 hover:underline dark:text-cyan-400">
              Back to log in
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
