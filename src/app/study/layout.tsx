import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StudyBodyChrome } from "@/study/components/study-body-chrome";
import { StudyLocaleProvider } from "@/study/components/study-locale-provider";
import { getStudyMessages } from "@/study/i18n/get-locale";
import "./study.css";

const studyFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-study",
  weight: ["500", "600", "700", "800"],
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
  themeColor: "#07070f",
};

export default async function StudyCoachLayout({ children }: { children: React.ReactNode }) {
  const { locale, t } = await getStudyMessages();
  return (
    <div lang={t.langTag} className={`study-coach ${studyFont.variable}`}>
      <StudyBodyChrome />
      <StudyLocaleProvider locale={locale}>
        {children}
      </StudyLocaleProvider>
    </div>
  );
}
