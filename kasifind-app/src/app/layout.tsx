import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { KfAppShell } from "@/components/kasifind/kf-app-shell";
import { KfHeader } from "@/components/kasifind/kf-header";
import { getPublishedListingCount } from "@/lib/kasifind/listing-count";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
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
  themeColor: "#0F4D3A",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const dbReady = isKasiFindDbConfigured();
  const sessionUser = dbReady ? await getKasiFindSessionUser().catch(() => null) : null;
  const headerUser = sessionUser
    ? { role: sessionUser.role, email: sessionUser.email }
    : null;
  const publishedListingCount = dbReady
    ? await getPublishedListingCount().catch(() => null)
    : null;

  return (
    <html lang="en-ZA">
      <body className={`kf-root ${inter.variable}`}>
        <KfAppShell>
          <KfHeader user={headerUser} publishedListingCount={publishedListingCount} />
          <main className="mx-auto max-w-5xl px-4 pb-8 pt-2 admin-main">{children}</main>
          <footer className="kf-footer">
            <p className="font-semibold text-[var(--kf-forest)]">KasiFind — Find local. Support local.</p>
            <p className="mt-2 max-w-md mx-auto leading-relaxed">
              Proudly South African local discovery for communities and entrepreneurs.
            </p>
          </footer>
        </KfAppShell>
      </body>
    </html>
  );
}
