import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { KfHeader } from "@/components/kasifind/kf-header";
import "./globals.css";
import "./kasifind.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KasiFind — Find local. Support local.",
    template: "%s | KasiFind",
  },
  description:
    "Discover trusted local services, skilled artisans and businesses across South Africa.",
  applicationName: "KasiFind",
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#0d3b2e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className={`kf-root ${inter.variable}`}>
        <KfHeader />
        <main className="mx-auto max-w-5xl px-4 pb-8 pt-2">{children}</main>
        <footer className="kf-footer">
          <p className="font-medium text-[var(--kf-charcoal)]">KasiFind — Find local. Support local.</p>
          <p className="mt-2 max-w-md mx-auto leading-relaxed">
            Proudly South African local discovery for communities and entrepreneurs.
          </p>
        </footer>
      </body>
    </html>
  );
}
