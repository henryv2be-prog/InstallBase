"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Plus,
  Search,
  Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { CountBadge } from "@/components/ui/count-badge";
import { getInitials } from "@/lib/utils";

const desktopNav = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Explore", icon: Compass },
];

const memberMobileNav = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: Plus, highlight: true },
  { href: "/activity", label: "Activity", icon: Bell, badge: true },
  { href: "/profile", label: "Profile", icon: null },
];

const guestMobileNav = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/discover", label: "Explore", icon: Compass },
  { href: "/signup", label: "Join", icon: Plus, highlight: true },
  { href: "/login", label: "Log in", icon: null },
];

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    image?: string | null;
    username?: string;
    role?: string;
  } | null;
  activityCount?: number;
}

export function AppShell({ children, user, activityCount = 0 }: AppShellProps) {
  const pathname = usePathname();
  const signedIn = Boolean(user);
  const mobileNavItems = signedIn ? memberMobileNav : guestMobileNav;

  return (
    <div className="relative min-h-dvh tech-bg">
      <header className="sticky top-0 z-50 border-b border-border bg-card/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4 lg:px-6">
          <Link href="/feed" className="min-w-0 shrink">
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200",
                    active
                      ? "bg-blue-500/10 text-blue-600 shadow-inner dark:bg-cyan-500/10 dark:text-cyan-400"
                      : "text-muted hover:bg-card hover:text-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-0.5 sm:gap-1">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link href="/search">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            {signedIn ? (
              <>
                <Link href="/activity" className="relative hidden md:inline-flex">
                  <Button variant="ghost" size="icon" aria-label="Activity">
                    <Bell className="h-5 w-5" />
                  </Button>
                  <CountBadge count={activityCount} />
                </Link>
                <Link href="/create" className="hidden sm:block">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin" className="hidden sm:block">
                    <Button variant="ghost" size="sm">Admin</Button>
                  </Link>
                )}
                <div className="hidden sm:block">
                  <UserMenu name={user?.name} image={user?.image} username={user?.username} />
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">Log in</Button>
                </Link>
                <Link href="/signup">
                  <Button size="sm">Join</Button>
                </Link>
              </>
            )}
          </div>
        </div>
        {!signedIn && (
          <div className="border-t border-blue-500/15 bg-blue-500/10 px-3 py-2 text-center text-xs sm:text-sm">
            <span className="text-foreground/80">Browsing as a guest. Join to post, follow, and message.</span>
            <Link href="/signup" className="ml-2 font-semibold text-blue-600 dark:text-cyan-400">Join free</Link>
            <span className="mx-1.5 text-muted">·</span>
            <Link href="/login" className="font-semibold hover:underline">Log in</Link>
          </div>
        )}
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 lg:px-6 md:pb-8 md:pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {mobileNavItems.map((item) => {
            if (item.href === "/profile") {
              return (
                <Link
                  key={item.href}
                  href={user?.username ? `/profile/${user.username}` : "/profile"}
                  className="flex min-w-[3.25rem] flex-col items-center gap-0.5 p-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">{getInitials(user?.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-medium text-muted">{item.label}</span>
                </Link>
              );
            }

            if (item.href === "/login") {
              return (
                <Link key={item.href} href="/login" className="flex min-w-[3.25rem] flex-col items-center gap-0.5 p-2 text-muted">
                  <span className="text-xs font-semibold">Log in</span>
                </Link>
              );
            }

            const Icon = item.icon!;
            const active = pathname.startsWith(item.href);

            if (item.highlight) {
              return (
                <Link key={item.href} href={item.href} className="flex flex-col items-center -mt-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-lg btn-glow">
                    <Icon className="h-6 w-6" />
                  </div>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex min-w-[3.25rem] flex-col items-center gap-0.5 p-2 transition-colors",
                  active ? "text-blue-600 dark:text-cyan-400" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                {"badge" in item && item.badge && <CountBadge count={activityCount} />}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
