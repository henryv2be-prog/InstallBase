"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trophy, HelpCircle, UserPlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getWelcomeMessage } from "@/lib/platform-roles";
import type { PlatformRole } from "@/generated/prisma/client";

const WELCOME_KEY = "ib-welcome-dismissed";

interface WelcomeModalProps {
  platformRoles?: PlatformRole[];
}

export function WelcomeModal({ platformRoles = [] }: WelcomeModalProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(WELCOME_KEY) !== "1") {
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(WELCOME_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  const welcomeMessage = getWelcomeMessage(platformRoles);
  const isInstallerFocused =
    platformRoles.includes("PROFESSIONAL") ||
    platformRoles.includes("SEEKING_WORK") ||
    platformRoles.length === 0;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl animate-fade-in">
        <div className="mb-4 flex items-start justify-between">
          <h2 className="text-xl font-bold">Welcome to InstallBase</h2>
          <button type="button" onClick={dismiss} className="rounded-lg p-1 text-muted hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Close">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-5 text-sm text-muted">{welcomeMessage}</p>
        {isInstallerFocused ? (
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500/15 text-blue-600">
                <Trophy className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Give brag points</p>
                <p className="text-sm text-muted">Recognise installs you admire with the trophy button.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 text-green-600">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Ask questions</p>
                <p className="text-sm text-muted">Get answers from installers who&apos;ve solved it before.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-500/15 text-purple-600">
                <UserPlus className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold">Follow installers</p>
                <p className="text-sm text-muted">Build your Following feed with people whose work you respect.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card/60 p-4 text-sm text-muted">
            Browse the feed to see real installation work, follow professionals, and message them when you need help.
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-2">
          <Button asChild onClick={dismiss}>
            <Link href={isInstallerFocused ? "/discover?tab=people" : "/discover"}>
              {isInstallerFocused ? "Find installers" : "Explore InstallBase"}
            </Link>
          </Button>
          {isInstallerFocused ? (
            <Button variant="outline" asChild onClick={dismiss}>
              <Link href="/create">Share an install</Link>
            </Button>
          ) : (
            <Button variant="outline" onClick={dismiss}>
              Browse feed
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
