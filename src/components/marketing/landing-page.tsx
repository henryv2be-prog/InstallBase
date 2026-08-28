import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, Users, Trophy, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { INSTALLER_IMAGES } from "@/lib/constants";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] dark:bg-gray-950">
      <header className="border-b border-gray-200 bg-white/90 backdrop-blur-md dark:border-gray-800 dark:bg-gray-950/90">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 font-bold text-white text-sm">
              IB
            </div>
            <span className="font-bold text-gray-900 dark:text-white">InstallBase</span>
          </Link>
          <div className="flex items-center gap-3">
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
        <div className="mx-auto max-w-7xl px-4 py-16 lg:px-6 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-blue-600">
                Install. Share. Learn. Connect.
              </p>
              <h1 className="text-4xl font-extrabold leading-tight text-gray-900 dark:text-white sm:text-5xl lg:text-6xl">
                Where Installers Share What They Build.
              </h1>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-400">
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
              <p className="mt-4 text-sm text-gray-500">
                For CCTV, access control, alarms, networking &amp; low-voltage installers
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {INSTALLER_IMAGES.map((src, i) => (
                <div
                  key={i}
                  className={`relative overflow-hidden rounded-2xl ${
                    i === 0 ? "col-span-2 aspect-[2/1]" : "aspect-square"
                  }`}
                >
                  <Image src={src} alt="Installation showcase" fill className="object-cover" sizes="400px" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-gray-200 bg-white py-20 dark:border-gray-800 dark:bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 lg:px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Camera,
                title: "Show Your Work",
                desc: "Turn your installations into your portfolio.",
              },
              {
                icon: Wrench,
                title: "Learn From Installers",
                desc: "Real-world solutions from people doing the work every day.",
              },
              {
                icon: Trophy,
                title: "Build Your Reputation",
                desc: "Get recognized for great installations and helpful advice.",
              },
              {
                icon: Users,
                title: "Find Your Community",
                desc: "Connect with installers who work with the same technology.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-200 p-6 dark:border-gray-800">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/50">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-gray-600 dark:text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-3xl px-4 text-center lg:px-6">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Ready to show off your next install?
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Join thousands of installers sharing knowledge, bragging about their best work,
            and solving real technical problems together.
          </p>
          <Link href="/signup" className="mt-8 inline-block">
            <Button size="lg">Get Started — It&apos;s Free</Button>
          </Link>
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 dark:border-gray-800">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 lg:px-6">
          <p className="font-semibold text-gray-900 dark:text-white">InstallBase</p>
          <p className="mt-1">Where installers share what they build.</p>
        </div>
      </footer>
    </div>
  );
}
