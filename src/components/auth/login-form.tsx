"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await signIn("credentials", {
        email: formData.get("email") as string,
        password: formData.get("password") as string,
        redirect: false,
      });
      if (result?.error) {
        toast.error("Invalid email or password");
      } else {
        router.push("/feed");
        router.refresh();
      }
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <p className="text-sm text-gray-500">Log in to InstallBase</p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <Input name="email" type="email" required placeholder="you@company.com" />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Password</label>
            <Input name="password" type="password" required placeholder="••••••••" />
          </div>
          <Button type="submit" className="w-full" disabled={pending}>
            {pending ? "Signing in..." : "Log in"}
          </Button>
        </form>
        <div className="mt-4 text-center text-sm text-gray-500">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-semibold text-blue-600 hover:underline">
            Sign up
          </Link>
        </div>
        <p className="mt-4 rounded-lg bg-gray-50 p-3 text-xs text-gray-500 dark:bg-gray-800">
          Demo: demo@installbase.io / InstallBase123!
        </p>
      </CardContent>
    </Card>
  );
}
