import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${jetbrains.variable}`}>
      <body className="min-h-dvh font-sans text-foreground antialiased">
        <ThemeInit />
        <SessionProvider>
          <ServiceWorkerRegistrar />
          {children}
          <PwaInstallBanner />
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
