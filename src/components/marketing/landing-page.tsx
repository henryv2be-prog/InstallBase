import Link from "next/link";
import {
  ArrowRight,
  Camera,
  Fingerprint,
  Cable,
  Sun,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingSlideshow } from "@/components/marketing/landing-slideshow";
import { SPECIALTIES } from "@/lib/constants";

const TRADES = [
  {
    icon: Camera,
    title: "CCTV",
    desc: "Cameras hung, cables dressed, NVR commissioned.",
  },
  {
    icon: Fingerprint,
    title: "Access Control",
    desc: "Readers, locks, controllers. Doors that actually report.",
  },
  {
    icon: Cable,
    title: "Networking",
    desc: "Racks you would photograph. Patching you would defend.",
  },
  {
    icon: Sun,
    title: "Solar",
    desc: "Arrays, inverters, and the sparkies who commission them.",
  },
];

export function LandingPage() {
  return (
    <div className="relative min-h-screen tech-bg">
      <header className="sticky top-0 z-20 border-b border-border bg-card/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button>Join InstallBase</Button>
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-20 h-64 w-64 rounded-full bg-blue-500/20 blur-3xl animate-pulse-glow" />
        <div className="pointer-events-none absolute -right-32 top-40 h-64 w-64 rounded-full bg-cyan-500/15 blur-3xl animate-pulse-glow" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-12 lg:px-6 lg:py-20">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 font-mono text-xs font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                <Zap className="h-3.5 w-3.5" />
                Install · Share · Learn · Connect
              </div>
              <h1 className="text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
                Where Installers{" "}
                <span className="text-gradient">Share What They Build</span>
              </h1>
              <p className="mt-6 text-lg text-muted">
                Show the install you&apos;re proud of. Ask the question that would take
                three WhatsApp groups. Find people who still care about a clean rack.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/signup">
                  <Button size="lg">
                    Join InstallBase
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    Explore Installations
                  </Button>
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {SPECIALTIES.filter((s) => s !== "Other").map((trade) => (
                  <span
                    key={trade}
                    className="rounded-full border border-border bg-card/60 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted"
                  >
                    {trade}
                  </span>
                ))}
              </div>
            </div>

            <LandingSlideshow />
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-border py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TRADES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-border bg-card/50 p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="mt-0.5 text-sm text-muted">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-border py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Camera,
                title: "Show Your Work",
                desc: "Turn installations into a portfolio — cameras, racks, readers, arrays.",
              },
              {
                icon: Wrench,
                title: "Learn From Installers",
                desc: "Cable tricks, device programming, and site fixes you will not find in a datasheet.",
              },
              {
                icon: Trophy,
                title: "Build Your Reputation",
                desc: "Get recognized for clean installs and answers that actually help on site.",
              },
              {
                icon: Users,
                title: "Find Your Community",
                desc: "Connect with people who work the same trades, brands, and problems.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-card glow-border rounded-2xl p-6 transition-transform hover:-translate-y-1"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-600 dark:text-cyan-400">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-bold">Ready to show off your next install?</h2>
          <p className="mt-4 text-muted">
            Join installers sharing CCTV, access control, networking, solar, and the
            jobs in between.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg">Get Started — It&apos;s Free</Button>
          </Link>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted lg:px-6">
          <Logo size="sm" className="justify-center" />
          <p className="mt-2">Where installers share what they build.</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider">
            CCTV · Access Control · Alarms · Networking · Solar
          </p>
        </div>
      </footer>
    </div>
  );
}
