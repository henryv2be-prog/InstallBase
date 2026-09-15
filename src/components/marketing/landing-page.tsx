import Link from "next/link";
import {
  ArrowRight,
  Bell,
  Camera,
  Cable,
  DoorOpen,
  Fingerprint,
  HelpCircle,
  ImageIcon,
  Phone,
  Sun,
  Trophy,
  Users,
  Wrench,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LandingHeroPreview } from "@/components/marketing/landing-hero-preview";
import { LandingShowcase } from "@/components/marketing/landing-showcase";
import { LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";
import { PageViewTracker } from "@/components/analytics/page-view-tracker";
import { LANDING_PAGE_KEY, TRADE_PHOTOS } from "@/lib/constants";
import type { PostCardData } from "@/lib/queries";

const TRADES = [
  {
    icon: Camera,
    title: "CCTV",
    desc: "Cameras, NVRs, cable runs and coverage you're proud of.",
    href: "/search?q=CCTV&type=posts",
  },
  {
    icon: Fingerprint,
    title: "Access Control",
    desc: "Readers, locks, controllers and doors that report.",
    href: "/search?q=Access+Control&type=posts",
  },
  {
    icon: Bell,
    title: "Alarms",
    desc: "Panels, sensors, zones and commissioning done right.",
    href: "/search?q=Alarms&type=posts",
  },
  {
    icon: DoorOpen,
    title: "Gate Automation",
    desc: "Motors, safety loops, photocells and programming.",
    href: "/search?q=Gate+Automation&type=posts",
  },
  {
    icon: Cable,
    title: "Networking",
    desc: "Racks, patching, fibre and VLANs worth showing.",
    href: "/search?q=Networking&type=posts",
  },
  {
    icon: Phone,
    title: "Intercoms",
    desc: "Door stations, handsets and site-wide comms.",
    href: "/search?q=Intercoms&type=posts",
  },
  {
    icon: Zap,
    title: "Electrical",
    desc: "Boards, containment, terminations and power work.",
    href: "/search?q=Electrician&type=posts",
  },
  {
    icon: Sun,
    title: "Solar",
    desc: "Arrays, inverters and systems you've commissioned.",
    href: "/search?q=Solar&type=posts",
  },
];

const VALUE_CARDS = [
  {
    icon: Camera,
    title: "Show Your Work",
    desc: "Post the installations you're proud of and build a portfolio of real jobs.",
  },
  {
    icon: HelpCircle,
    title: "Solve Problems",
    desc: "Ask the question you would normally send to three WhatsApp groups.",
  },
  {
    icon: Wrench,
    title: "Learn From Installers",
    desc: "See how other professionals approach equipment, wiring, programming and difficult site problems.",
  },
  {
    icon: Trophy,
    title: "Build Your Reputation",
    desc: "Your reputation grows from the work and knowledge you share.",
  },
];

const GALLERY_SHOTS = [
  TRADE_PHOTOS.cctvOutdoor,
  TRADE_PHOTOS.networkPatch,
  TRADE_PHOTOS.accessReader,
  TRADE_PHOTOS.solarRoof,
  TRADE_PHOTOS.cctvIndustrial,
  TRADE_PHOTOS.electrician,
];

interface LandingPageProps {
  showcasePosts?: PostCardData[];
}

export function LandingPage({ showcasePosts = [] }: LandingPageProps) {
  const portfolioExamples = LANDING_EXAMPLE_POSTS.filter((p) => p.type !== "question").slice(0, 4);

  return (
    <div className="relative min-h-screen tech-bg">
      <PageViewTracker pageKey={LANDING_PAGE_KEY} />

      <header className="sticky top-0 z-30 border-b border-border bg-card/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 lg:px-6">
          <Link href="/" className="shrink-0">
            <Logo size="md" />
          </Link>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="hidden sm:block">
              <ThemeToggle />
            </div>
            <Link href="/feed" className="hidden sm:block">
              <Button variant="ghost">Explore</Button>
            </Link>
            <Link href="/login">
              <Button variant="ghost" size="sm" className="sm:h-10 sm:px-4 sm:text-sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="sm:h-10 sm:px-4 sm:text-sm">
                Join
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-16 h-48 w-48 rounded-full bg-blue-500/15 blur-3xl sm:h-64 sm:w-64" />
        <div className="pointer-events-none absolute -right-24 top-32 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl sm:h-64 sm:w-64" />

        <div className="relative z-10 mx-auto max-w-7xl px-4 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:px-6 lg:pb-20 lg:pt-16">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="order-2 lg:order-1">
              <p className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-cyan-400">
                For CCTV, access, alarms, networking & more
              </p>
              <h1 className="text-[2rem] font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.25rem]">
                Your work is{" "}
                <span className="text-gradient">your CV.</span>
              </h1>
              <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
                InstallBase is where installers share the jobs they&apos;ve actually done, solve
                problems on site, learn from other professionals and build a portfolio of real
                work.
              </p>
              <p className="mt-3 text-sm text-muted/90 sm:text-base">
                Stop keeping your best work buried in your phone gallery.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/signup" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full sm:w-auto">
                    Join InstallBase — It&apos;s Free
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/feed" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Explore InstallBase
                  </Button>
                </Link>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <LandingHeroPreview />
            </div>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="relative z-10 border-t border-border bg-card/30 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                You&apos;ve already got the portfolio.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Every day you&apos;re taking photos of cameras, racks, panels, gates, access
                systems, cable runs and finished installations.
              </p>
              <p className="mt-3 font-medium text-foreground">
                Most of them never leave your phone.
              </p>
              <p className="mt-4 text-muted">
                InstallBase gives that work somewhere useful to live.
              </p>
            </div>

            <div className="relative">
              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <div className="col-span-1 rounded-2xl border border-border bg-card/60 p-3 sm:p-4">
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-muted">
                    <ImageIcon className="h-4 w-4" />
                    Phone gallery
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {GALLERY_SHOTS.map((src, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        key={src}
                        src={src}
                        alt=""
                        className="aspect-square rounded-md object-cover opacity-80"
                        loading="lazy"
                      />
                    ))}
                  </div>
                </div>

                <div className="col-span-1 flex flex-col justify-center">
                  <div className="flex items-center justify-center py-2">
                    <ArrowRight className="h-6 w-6 text-blue-500 dark:text-cyan-400" />
                  </div>
                </div>

                <div className="col-span-2 rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-4 sm:p-5">
                  <p className="mb-3 font-mono text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                    Your InstallBase portfolio
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {portfolioExamples.map((post) => (
                      <div
                        key={post.id}
                        className="overflow-hidden rounded-lg border border-border bg-card/80"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={post.image}
                          alt={post.imageAlt}
                          className="aspect-[4/3] w-full object-cover"
                          loading="lazy"
                        />
                        <p className="truncate px-2 py-1.5 text-[11px] font-medium">
                          {post.title ?? post.trade}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What people do */}
      <section className="relative z-10 border-t border-border py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              What people actually do here
            </h2>
            <p className="mt-3 text-muted">
              Not another feed of hot takes — a place to show installs, ask real questions and learn
              from people who do the same work.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {VALUE_CARDS.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="glass-card glow-border rounded-2xl p-5 sm:p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/15 text-blue-600 dark:text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <LandingShowcase posts={showcasePosts} />

      {/* Not another social network */}
      <section className="relative z-10 border-t border-border py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl lg:text-4xl">
              Not likes. Not influencers.{" "}
              <span className="text-gradient">Just the work.</span>
            </h2>
            <p className="mt-5 text-base leading-relaxed text-muted sm:text-lg">
              InstallBase is built around what installers actually do — the jobs, the problems, the
              solutions and the knowledge behind them.
            </p>
          </div>
        </div>
      </section>

      {/* Portfolio / CV */}
      <section className="relative z-10 border-t border-border bg-card/20 py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid items-start gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                Your profile becomes a portfolio of your real work.
              </h2>
              <p className="mt-4 text-muted leading-relaxed">
                Instead of writing a CV that says &ldquo;CCTV installation — 10 years
                experience&rdquo;, you can actually show:
              </p>
              <ul className="mt-5 space-y-2.5 text-sm sm:text-base">
                {[
                  "The cameras you installed",
                  "The rack you dressed",
                  "The access system you commissioned",
                  "The solar system you fitted",
                  "The problems you solved on site",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-blue-500 dark:bg-cyan-400" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-dashed border-border bg-card/40 p-5 opacity-70">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted">
                  Traditional CV
                </p>
                <p className="mt-3 text-sm text-muted leading-relaxed">
                  CCTV Installation — 10 years experience.
                  <br />
                  Access control systems.
                  <br />
                  Networking and low voltage.
                </p>
              </div>

              <div className="glass-card glow-border rounded-2xl p-5">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-widest text-blue-600 dark:text-cyan-400">
                  Your InstallBase profile
                </p>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                  {portfolioExamples.map((post) => (
                    <div
                      key={post.id}
                      className="overflow-hidden rounded-xl border border-border bg-card/50"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={post.image}
                        alt={post.imageAlt}
                        className="aspect-[4/3] w-full object-cover"
                        loading="lazy"
                      />
                      <div className="p-2.5">
                        <p className="text-[10px] font-mono uppercase tracking-wide text-muted">
                          {post.trade}
                        </p>
                        <p className="mt-0.5 line-clamp-2 text-xs font-medium">
                          {post.title ?? post.content}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trades */}
      <section className="relative z-10 border-t border-border py-14 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="mb-8 max-w-2xl sm:mb-10">
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Built for the people who install things.
            </h2>
            <p className="mt-3 text-muted">
              CCTV, access, alarms, gates, networking, intercoms, electrical and solar — if you fit
              things on site, you belong here.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TRADES.map(({ icon: Icon, title, desc, href }) => (
              <Link
                key={title}
                href={href}
                className="group flex gap-3 rounded-2xl border border-border bg-card/50 p-4 transition-colors hover:border-blue-500/40 hover:bg-card active:scale-[0.99]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/15 text-blue-600 transition-transform group-hover:scale-105 dark:text-cyan-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold group-hover:text-blue-600 dark:group-hover:text-cyan-400">
                    {title}
                  </h3>
                  <p className="mt-0.5 text-sm text-muted line-clamp-2">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Early community */}
      <section className="relative z-10 border-t border-border py-14 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-4 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-widest text-muted">
            <Users className="h-3.5 w-3.5" />
            Early community
          </div>
          <h2 className="mt-5 text-2xl font-extrabold tracking-tight sm:text-3xl">
            Built for installers, by installers.
          </h2>
          <p className="mt-4 text-muted leading-relaxed">
            InstallBase is starting with the people who actually do the work. No inflated numbers, no
            fake reviews — just a place to share what you build and learn from people who get it.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative z-10 border-t border-border py-16 sm:py-24">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Got a job worth showing?
          </h2>
          <p className="mt-4 text-base text-muted sm:text-lg">
            Share it. Learn from others. Build your portfolio.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-center">
            <Link href="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">
                Join InstallBase — It&apos;s Free
              </Button>
            </Link>
            <Link href="/feed" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore the community
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted lg:px-6">
          <Logo size="sm" className="justify-center" />
          <p className="mt-2">Your work is your CV.</p>
          <p className="mt-1 font-mono text-[11px] uppercase tracking-wider">
            CCTV · Access Control · Alarms · Gate Automation · Networking · Intercoms · Electrical ·
            Solar
          </p>
        </div>
      </footer>
    </div>
  );
}
