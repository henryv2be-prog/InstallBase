"use client";

import { useTransition } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface LogoutButtonProps {
  compact?: boolean;
}

export function LogoutButton({ compact = false }: LogoutButtonProps) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant={compact ? "ghost" : "outline"}
      size={compact ? "icon" : "default"}
      disabled={pending}
      aria-label="Log out"
      title="Log out"
      onClick={() =>
        startTransition(() => {
          signOut({ callbackUrl: "/" });
        })
      }
      className={cn(
        !compact && "text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950/30"
      )}
    >
      <LogOut className="h-4 w-4" />
      {!compact && (pending ? "Logging out..." : "Log out")}
    </Button>
  );
}
