import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { KfAppShell } from "@/components/kasifind/kf-app-shell";
import { KfHeaderAsync } from "@/components/kasifind/kf-header-async";
import { KfHeaderLoaderFallback } from "@/components/kasifind/kf-page-loader";
import { KfSiteFooter } from "@/components/kasifind/kf-site-footer";
import "./globals.css";
import "./kasifind.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "KasiFind — Find local. Support local. Grow local.",
    template: "%s | KasiFind",
  },
  description:
    "Discover trusted local services, skilled artisans and businesses across South Africa.",
  applicationName: "KasiFind",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0F4D3A",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-ZA">
      <body className={`kf-root kf-tech-bg ${inter.variable}`}>
        <KfAppShell>
          <Suspense fallback={<KfHeaderLoaderFallback />}>
            <KfHeaderAsync />
          </Suspense>
          <main className="mx-auto max-w-5xl px-4 pb-8 pt-2 admin-main">{children}</main>
          <KfSiteFooter />
        </KfAppShell>
      </body>
    </html>
  );
}
