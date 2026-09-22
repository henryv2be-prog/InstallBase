import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { StudyBodyChrome } from "@/study/components/study-body-chrome";
import { StudyThemeDocumentBoot } from "@/study/components/study-theme-document-boot";
import { StudyLocaleProvider } from "@/study/components/study-locale-provider";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { getStudyTheme } from "@/study/lib/get-study-theme";
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

export async function generateViewport(): Promise<Viewport> {
  const theme = await getStudyTheme();
  return {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
    themeColor: theme === "light" ? "#f1f5f9" : "#07070f",
  };
}

export default async function StudyCoachLayout({ children }: { children: React.ReactNode }) {
  const [{ locale, t }, theme] = await Promise.all([getStudyMessages(), getStudyTheme()]);
  return (
    <div
      lang={t.langTag}
      className={`study-coach study-coach--${theme} ${studyFont.variable}`}
    >
      <StudyThemeDocumentBoot />
      <StudyBodyChrome theme={theme} />
      <StudyLocaleProvider locale={locale}>
        {children}
      </StudyLocaleProvider>
    </div>
  );
}
