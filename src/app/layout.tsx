import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "InstallBase — Where installers share what they build",
    template: "%s | InstallBase",
  },
  description:
    "Social network for technical installers. Show your work, share knowledge, and connect with CCTV, security, and low-voltage professionals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className="min-h-screen bg-[#F5F7FA] font-sans text-gray-900 antialiased dark:bg-gray-950 dark:text-gray-100">
        <SessionProvider>
          <ThemeProvider>
            {children}
            <ToastProvider />
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
