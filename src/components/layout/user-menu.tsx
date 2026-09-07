"use client";

import Link from "next/link";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Settings, LogOut, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { useTransition } from "react";

interface UserMenuProps {
  name?: string | null;
  image?: string | null;
  username?: string;
}

export function UserMenu({ name, image, username }: UserMenuProps) {
  const [pending, startTransition] = useTransition();
  const profileHref = username ? `/profile/${username}` : "/profile";

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button type="button" className="rounded-full ring-2 ring-transparent transition-all hover:ring-blue-500/50 focus:outline-none focus:ring-blue-500/50" aria-label="Account menu">
          <Avatar className="h-9 w-9">
            <AvatarImage src={image ?? undefined} />
            <AvatarFallback>{getInitials(name ?? "U")}</AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="z-50 min-w-[200px] rounded-xl border border-border bg-card p-1 shadow-lg animate-in fade-in-0 zoom-in-95"
          align="end"
          sideOffset={8}
        >
          <DropdownMenu.Item asChild>
            <Link href={profileHref} className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800">
              <User className="h-4 w-4" />
              My profile
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Item asChild>
            <Link href="/settings" className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm outline-none hover:bg-slate-100 dark:hover:bg-slate-800">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </DropdownMenu.Item>
          <DropdownMenu.Separator className="my-1 h-px bg-border" />
          <DropdownMenu.Item
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 outline-none hover:bg-red-50 dark:hover:bg-red-950/30"
            disabled={pending}
            onSelect={() => startTransition(() => signOut({ callbackUrl: "/" }))}
          >
            <LogOut className="h-4 w-4" />
            {pending ? "Logging out..." : "Log out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
