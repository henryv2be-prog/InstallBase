import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./kasifind.css";

export const metadata: Metadata = {
  title: {
    default: "KasiFind — Find local. Support local.",
    template: "%s | KasiFind",
  },
  description:
    "Discover nearby informal traders, artisans and local service providers across South Africa.",
  applicationName: "KasiFind",
};

export const viewport: Viewport = {
  themeColor: "#007749",
  width: "device-width",
  initialScale: 1,
};

export default function KasiFindLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="kf-root">
      <header className="kf-header sticky top-0 z-40 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3">
          <Link href="/kasifind" className="min-w-0">
            <div className="kf-wordmark text-xl sm:text-2xl">KasiFind</div>
            <p className="kf-tagline truncate">Find local. Support local.</p>
          </Link>
          <nav className="flex shrink-0 items-center gap-2 text-sm font-medium">
            <Link
              href="/kasifind/account/listing"
              className="rounded-lg px-3 py-2 text-[var(--kf-green-dark)] hover:bg-black/5"
            >
              List your business
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 pb-16 pt-6">{children}</main>
      <footer className="border-t border-black/10 bg-white px-4 py-6 text-center text-xs text-[var(--kf-muted)]">
        <p>KasiFind — proudly South African local discovery.</p>
        <p className="mt-1">
          <Link href="/" className="underline">
            InstallBase
          </Link>{" "}
          hosts this app; KasiFind uses a separate database.
        </p>
      </footer>
    </div>
  );
}
