import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, JetBrains_Mono } from "next/font/google";
import { getSession } from "@/lib/session";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SessionProvider } from "@/components/providers/session-provider";
import { ThemeInit } from "@/components/providers/theme-init";
import { PwaInstallBanner } from "@/components/pwa/install-banner";
import { ServiceWorkerRegistrar } from "@/components/pwa/service-worker-registrar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: {
    default: "InstallBase — Where installers share what they build",
    template: "%s | InstallBase",
  },
  description:
    "Social network for technical installers. Show your work, share knowledge, and connect with CCTV, security, and low-voltage professionals.",
  applicationName: "InstallBase",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "InstallBase",
  },
  formatDetection: { telephone: false },
  other: {
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#050810",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        <Script id="pwa-sw-register" strategy="beforeInteractive">
          {`if("serviceWorker"in navigator){navigator.serviceWorker.register("/sw.js",{scope:"/",updateViaCache:"none"});}`}
        </Script>
        <ThemeInit />
        <SessionProvider session={session}>
          <ServiceWorkerRegistrar />
          {children}
          <PwaInstallBanner />
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
