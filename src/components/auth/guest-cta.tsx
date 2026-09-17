"use client";

import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { loginHref, signupHref } from "@/lib/auth-urls";

export function promptJoin(action: string, next?: string) {
  toast.error(`Join to ${action}`, {
    action: {
      label: "Join",
      onClick: () => {
        window.location.href = signupHref(next ?? window.location.pathname);
      },
    },
  });
}

export function GuestJoinCard({
  title = "Join to take part",
  body = "Browse freely as a guest. Create an account to post, follow, brag, and message installers.",
  next = "/feed",
}: {
  title?: string;
  body?: string;
  next?: string;
}) {
  return (
    <div className="rounded-2xl border border-blue-500/25 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-5">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-1 text-sm text-muted">{body}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button asChild>
          <Link href={signupHref(next)}>Join free</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={loginHref(next)}>Log in</Link>
        </Button>
      </div>
    </div>
  );
}

export function GuestInlineCta({ action, next }: { action: string; next?: string }) {
  return (
    <p className="mb-4 rounded-xl border border-dashed border-border bg-card/40 px-4 py-3 text-sm text-muted">
      <Link
        href={signupHref(next)}
        className="font-semibold text-blue-600 hover:underline dark:text-cyan-400"
      >
        Join free
      </Link>
      {" "}or{" "}
      <Link href={loginHref(next)} className="font-semibold hover:underline">
        log in
      </Link>
      {" "}to {action}.
    </p>
  );
}
