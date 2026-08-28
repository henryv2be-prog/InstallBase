import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Users, Trophy, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { INSTALLER_IMAGES } from "@/lib/constants";

export function LandingPage() {
  return (
    <div className="relative min-h-screen tech-bg">
      <header className="relative z-10 border-b border-border bg-card/60 backdrop-blur-xl">
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

        <div className="relative z-10 mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
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
                Connect with installers. Show off your work. Solve technical problems.
                Discover better ways to install.
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
              <p className="mt-4 font-mono text-xs text-muted">
                CCTV · Access Control · Alarms · Networking · Low Voltage
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {INSTALLER_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className={`glass-card glow-border relative overflow-hidden ${
                    i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                  }`}
                >
                  <Image src={src} alt="Installation showcase" fill className="object-cover" sizes="400px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 border-t border-border py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Camera, title: "Show Your Work", desc: "Turn your installations into your portfolio." },
              { icon: Wrench, title: "Learn From Installers", desc: "Real-world solutions from people doing the work every day." },
              { icon: Trophy, title: "Build Your Reputation", desc: "Get recognized for great installations and helpful advice." },
              { icon: Users, title: "Find Your Community", desc: "Connect with installers who work with the same technology." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="glass-card glow-border rounded-2xl p-6 transition-transform hover:-translate-y-1">
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

      <section className="relative z-10 py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-bold">
            Ready to show off your next install?
          </h2>
          <p className="mt-4 text-muted">
            Join thousands of installers sharing knowledge, bragging about their best work,
            and solving real technical problems together.
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
        </div>
      </footer>
    </div>
  );
}
