import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./study.css";

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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#0c1222",
};

export default function StudyCoachLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`study-coach ${dmSans.variable} font-[family-name:var(--font-study)]`}>
      {children}
    </div>
  );
}
