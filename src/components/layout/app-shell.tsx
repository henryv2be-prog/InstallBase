"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Plus,
  Search,
  Bell,
  Shield,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { ActivityCountBadge } from "@/components/layout/activity-count-badge";
import { UploadProgressBanner } from "@/components/feed/upload-progress-banner";
import { getInitials } from "@/lib/utils";

const desktopNav = [
  { href: "/feed/watch", label: "Home", icon: Home },
  { href: "/discover/watch", label: "Explore", icon: Compass },
];

const memberMobileNav = [
  { href: "/feed/watch", label: "Home", icon: Home },
  { href: "/discover/watch", label: "Explore", icon: Compass },
  { href: "/create", label: "Create", icon: Plus, highlight: true },
  { href: "/activity", label: "Activity", icon: Bell, badge: true },
  { href: "/profile", label: "Profile", icon: null },
];

const guestMobileNav = [
  { href: "/feed/watch", label: "Home", icon: Home },
  { href: "/discover/watch", label: "Explore", icon: Compass },
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
}

export function AppShell({ children, user }: AppShellProps) {
  const pathname = usePathname();
  const signedIn = Boolean(user);
  const isAdmin = user?.role === "ADMIN";
  const isAdminRoute = pathname.startsWith("/admin");
  const isImmersiveRoute =
    pathname.startsWith("/feed/watch") || pathname.startsWith("/discover/watch");
  const isCreateFlowRoute =
    pathname === "/create" || /^\/post\/[^/]+\/edit$/.test(pathname);
  const isViewportLockRoute = isImmersiveRoute || isCreateFlowRoute;
  const isClassicFeed = pathname === "/feed" || pathname.startsWith("/feed?");
  /** Glass floating nav on all mobile app routes (New look chrome). */
  const glassMobileNav = !isAdminRoute;
  const mobileNavItems = signedIn ? memberMobileNav : guestMobileNav;

  const homeActive =
    pathname.startsWith("/feed/watch") ||
    isClassicFeed ||
    pathname === "/feed";

  useEffect(() => {
    if (!isViewportLockRoute) return;
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, [isViewportLockRoute]);

  return (
    <div
      className={cn(
        "relative min-h-dvh tech-bg",
        glassMobileNav && "app-shell-mobile-new-look",
        isViewportLockRoute && "app-shell-viewport-lock"
      )}
    >
      <header
        className={cn(
          "sticky top-0 z-50 border-b pt-[env(safe-area-inset-top)] backdrop-blur-xl",
          glassMobileNav
            ? "max-md:border-white/10 max-md:bg-[rgba(8,12,22,0.55)] md:border-border md:bg-card/70"
            : "border-border bg-card/70"
        )}
      >
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4 lg:px-6">
          <Link href="/feed/watch" className="min-w-0 shrink">
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/feed/watch"
                  ? pathname.startsWith("/feed/watch") || pathname.startsWith("/feed")
                  : pathname.startsWith(item.href);
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
                  <ActivityCountBadge />
                </Link>
                <Link href="/create" className="hidden sm:block">
                  <Button size="sm">
                    <Plus className="h-4 w-4" />
                    Create
                  </Button>
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/admin" className="sm:hidden">
                      <Button variant="ghost" size="icon" aria-label="Admin dashboard">
                        <Shield className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/admin/ads" className="sm:hidden">
                      <Button variant="ghost" size="icon" aria-label="Advertising admin">
                        <Megaphone className="h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/admin" className="hidden sm:block">
                      <Button variant="ghost" size="sm">Admin</Button>
                    </Link>
                  </>
                )}
                <div className="hidden sm:block">
                  <UserMenu
                    name={user?.name}
                    image={user?.image}
                    username={user?.username}
                    isAdmin={isAdmin}
                  />
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
        {!signedIn && !isViewportLockRoute && (
          <div className="border-t border-blue-500/15 bg-blue-500/10 px-3 py-2 text-center text-xs sm:text-sm">
            <span className="text-foreground/80">Browsing as a guest. Join to post, follow, and message.</span>
            <Link href="/signup" className="ml-2 font-semibold text-blue-600 dark:text-cyan-400">Join free</Link>
            <span className="mx-1.5 text-muted">·</span>
            <Link href="/login" className="font-semibold hover:underline">Log in</Link>
          </div>
        )}
      </header>

      <main
        className={cn(
          "relative z-10 mx-auto max-w-7xl md:pt-6",
          isViewportLockRoute
            ? cn("mx-0 w-full max-w-none px-0 pt-0 md:pb-8", isCreateFlowRoute && "max-md:px-2 max-md:pt-2")
            : "px-3 pt-4 sm:px-4 lg:px-6",
          isAdminRoute
            ? "pb-6 md:pb-8"
            : !isViewportLockRoute && glassMobileNav
              ? "max-md:pb-[var(--app-mobile-bottom-clearance)] md:pb-8"
              : !isViewportLockRoute
                ? "pb-[calc(var(--app-mobile-nav-reserve)+0.75rem+env(safe-area-inset-bottom))] md:pb-8"
                : null
        )}
      >
        <div
          className={cn(
            isViewportLockRoute && "app-main-slot",
            !isViewportLockRoute && !isAdminRoute && "mobile-app-page-inner md:contents"
          )}
        >
          {children}
        </div>
      </main>

      {signedIn ? <UploadProgressBanner /> : null}

      <nav
        className={cn(
          "fixed bottom-0 left-0 right-0 z-[60] md:hidden",
          glassMobileNav
            ? "pointer-events-none border-0 bg-transparent px-3 pb-[var(--app-mobile-nav-watch-edge)]"
            : "border-t border-border bg-card/95 pb-[max(0.25rem,env(safe-area-inset-bottom))] backdrop-blur-xl",
          isAdminRoute && "hidden"
        )}
      >
        <div
          className={cn(
            glassMobileNav
              ? "mobile-nav-glass-dock pointer-events-auto mx-auto flex max-w-lg items-center justify-between gap-1 rounded-2xl p-1.5"
              : "mx-auto flex min-h-[var(--app-mobile-nav-reserve)] max-w-lg items-center justify-around px-2 pt-1"
          )}
        >
          {mobileNavItems.map((item) => {
            const glassTab = cn(
              "flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1 transition-all duration-200",
              glassMobileNav && "mobile-nav-glass-btn min-h-[2.875rem]"
            );

            if (item.href === "/profile") {
              return (
                <Link
                  key={item.href}
                  href={user?.username ? `/profile/${user.username}` : "/profile"}
                  className={cn(
                    glassTab,
                    glassMobileNav &&
                      (pathname.startsWith("/profile")
                        ? "mobile-nav-glass-btn-active"
                        : undefined),
                    !glassMobileNav && "min-w-[3.25rem] p-2"
                  )}
                >
                  <Avatar className="h-6 w-6 border border-white/15">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">{getInitials(user?.name ?? "U")}</AvatarFallback>
                  </Avatar>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      !glassMobileNav && "text-muted"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            if (item.href === "/login") {
              return (
                <Link
                  key={item.href}
                  href="/login"
                  className={cn(glassTab, !glassMobileNav && "min-w-[3.25rem] p-2 text-muted")}
                >
                  <span className="text-xs font-semibold leading-none">Log in</span>
                </Link>
              );
            }

            const Icon = item.icon!;
            const active =
              item.href === "/feed/watch"
                ? homeActive
                : pathname.startsWith(item.href);

            if (item.highlight) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    glassTab,
                    glassMobileNav && "mobile-nav-glass-btn-create",
                    !glassMobileNav && "min-w-[3.25rem] px-1 py-0.5"
                  )}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md ring-1 ring-white/25 btn-glow">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-medium leading-none",
                      !glassMobileNav && "text-muted"
                    )}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  glassTab,
                  "relative",
                  glassMobileNav && active && "mobile-nav-glass-btn-active",
                  !glassMobileNav && "min-w-[3.25rem] p-2",
                  !glassMobileNav && (active ? "text-blue-600 dark:text-cyan-400" : "text-muted")
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {"badge" in item && item.badge && <ActivityCountBadge />}
                <span className="text-[10px] font-medium leading-none">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

/** Chrome shown while the signed-in session is resolving — keeps the PWA from flashing a blank page. */
export function AppShellFallback({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh tech-bg">
      <header className="sticky top-0 z-50 border-b border-border bg-card/70 pt-[env(safe-area-inset-top)] backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:px-4 lg:px-6">
          <Link href="/feed/watch" className="min-w-0 shrink">
            <Logo size="md" />
          </Link>
          <nav className="hidden items-center gap-1 md:flex">
            {desktopNav.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-0.5 sm:gap-1">
            <ThemeToggle />
            <span className="inline-flex h-9 w-9 rounded-xl bg-gray-200 dark:bg-gray-800" />
            <span className="inline-flex h-9 w-9 rounded-full bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-3 pb-[calc(5.5rem+env(safe-area-inset-bottom))] pt-4 sm:px-4 lg:px-6 md:pb-8 md:pt-6">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-1 py-1.5">
          {memberMobileNav.map((item) => {
            if (item.highlight) {
              return (
                <div key={item.href} className="flex min-w-[3.25rem] flex-col items-center gap-0.5 px-1 py-0.5">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md btn-glow">
                    <Plus className="h-5 w-5" />
                  </div>
                  <span className="text-[10px] font-medium leading-none text-muted">Create</span>
                </div>
              );
            }
            return (
              <div key={item.href} className="flex min-w-[3.25rem] flex-col items-center gap-0.5 p-2">
                <span className="h-5 w-5 rounded-md bg-gray-200 dark:bg-gray-800" />
                <span className="mt-0.5 h-2 w-8 rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
