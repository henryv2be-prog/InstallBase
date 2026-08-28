"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Compass,
  Trophy,
  HelpCircle,
  FolderKanban,
  Search,
  Bell,
  MessageCircle,
  Plus,
  Briefcase,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LogoutButton } from "@/components/auth/logout-button";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/feed", label: "Feed", icon: Home },
  { href: "/discover", label: "Discover", icon: Compass },
  { href: "/brags", label: "Brags", icon: Trophy },
  { href: "/questions", label: "Questions", icon: HelpCircle },
  { href: "/projects", label: "Projects", icon: FolderKanban },
];

const mobileNavItems = [
  { href: "/feed", label: "Home", icon: Home },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/create", label: "Create", icon: Plus, highlight: true },
  { href: "/notifications", label: "Alerts", icon: Bell },
  { href: "/profile", label: "Profile", icon: null },
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

  return (
    <div className="relative min-h-screen tech-bg">
      <header className="sticky top-0 z-50 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/feed">
            <Logo size="md" />
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
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

          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Link href="/search" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Search">
                <Search className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/notifications" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/messages" className="hidden sm:block">
              <Button variant="ghost" size="icon" aria-label="Messages">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/create" className="hidden sm:block">
              <Button size="sm">
                <Plus className="h-4 w-4" />
                Create
              </Button>
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className="hidden sm:block">
                <Button variant="ghost" size="icon" aria-label="Admin">
                  <Shield className="h-5 w-5" />
                </Button>
              </Link>
            )}
            <Link href={user?.username ? `/profile/${user.username}` : "/profile"}>
              <Avatar className="h-9 w-9 ring-2 ring-transparent transition-all hover:ring-blue-500/50">
                <AvatarImage src={user?.image ?? undefined} />
                <AvatarFallback>{getInitials(user?.name ?? "U")}</AvatarFallback>
              </Avatar>
            </Link>
            <div className="hidden sm:block">
              <LogoutButton compact />
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-6 lg:px-6 md:pb-8">
        {children}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/80 backdrop-blur-xl md:hidden">
        <div className="flex items-center justify-around px-2 py-2">
          {mobileNavItems.map((item) => {
            if (item.href === "/profile") {
              return (
                <Link
                  key={item.href}
                  href={user?.username ? `/profile/${user.username}` : "/profile"}
                  className="flex flex-col items-center gap-1 p-2"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user?.image ?? undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(user?.name ?? "U")}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-medium text-muted">{item.label}</span>
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
                  "flex flex-col items-center gap-1 p-2 transition-colors",
                  active ? "text-blue-600 dark:text-cyan-400" : "text-muted"
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function JobsLink() {
  return (
    <Link
      href="/jobs"
      className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
    >
      <Briefcase className="h-4 w-4" />
      Jobs
    </Link>
  );
}
