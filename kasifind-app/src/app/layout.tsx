import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { headers } from "next/headers";
import { Suspense } from "react";
import { KfAppShell } from "@/components/kasifind/kf-app-shell";
import { KfHeaderAsync } from "@/components/kasifind/kf-header-async";
import { KfHeaderLoaderFallback } from "@/components/kasifind/kf-page-loader";
import { KfSiteFooter } from "@/components/kasifind/kf-site-footer";
import { KASIFIND_PRODUCTION_ORIGIN } from "@/lib/kasifind/seo-canonical";
import { getConfiguredSiteOrigin, resolvePublicSiteOrigin } from "@/lib/kasifind/site-config";
import "./globals.css";
import "./kasifind.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const defaultDescription =
  "Discover trusted local services, skilled artisans and businesses across South Africa.";

const rootTitle = "KasiFind — Find local. Support local. Grow local.";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const siteOrigin =
    resolvePublicSiteOrigin(headerStore) ??
    getConfiguredSiteOrigin() ??
    KASIFIND_PRODUCTION_ORIGIN;
  return {
    metadataBase: new URL(siteOrigin),
    title: {
      default: rootTitle,
      template: "%s | KasiFind",
    },
    description: defaultDescription,
    applicationName: "KasiFind",
    openGraph: {
      type: "website",
      locale: "en_ZA",
      siteName: "KasiFind",
      images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "KasiFind" }],
    },
    icons: {
      icon: [
        { url: "/icon.svg", type: "image/svg+xml" },
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    },
  };
}

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
