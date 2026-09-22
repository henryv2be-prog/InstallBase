import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import { getSession } from "@/lib/session";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { SessionProvider } from "@/components/providers/session-provider";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-study",
});

export const metadata: Metadata = {
  title: {
    default: "Grade 12 Study Coach",
    template: "%s · Study Coach",
  },
  description:
    "Personalised Grade 12 NSC study coach for South African learners — know what to study next.",
  applicationName: "Grade 12 Study Coach",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Study Coach",
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1222",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <html lang="en" suppressHydrationWarning className={dmSans.variable}>
      <body className="min-h-dvh bg-[#0c1222] font-[family-name:var(--font-study)] text-[#f8fafc] antialiased">
        <SessionProvider session={session}>
          {children}
          <ToastProvider />
        </SessionProvider>
      </body>
    </html>
  );
}
