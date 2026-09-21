import Link from "next/link";
import { redirect } from "next/navigation";
import { StudyLanguageSwitcher } from "@/study/components/study-language-switcher";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";

export const dynamic = "force-dynamic";

export default async function StudyCoachHomePage() {
  const learner = await getStudyLearnerForRequest();
  if (isLearnerOnboarded(learner)) {
    redirect("/study/dashboard");
  }

  const { t } = await getStudyMessages();

  return (
    <StudyShell>
      <section className="mb-8 pt-4">
        <span className="study-pill study-pill--prototype">{t.landing.pill}</span>
        <h1 className="study-display mt-5">
          {t.landing.titleLine1}
          <br />
          {t.landing.titleLine2}
        </h1>
        <p className="study-lead mt-4">{t.landing.lead}</p>
      </section>

      <section className="study-panel p-5 mb-8 space-y-3">
        <p className="font-bold text-lg">{t.landing.setupTitle}</p>
        <ul className="space-y-2 text-sm text-[var(--study-muted)]">
          <li>✓ {t.landing.setupBullet1}</li>
          <li>✓ {t.landing.setupBullet2}</li>
          <li>✓ {t.landing.setupBullet3}</li>
        </ul>
      </section>

      <div className="mt-auto space-y-3">
        <Link
          href="/study/onboarding"
          className="study-btn study-btn-primary study-touch-target block w-full text-center"
        >
          {t.landing.cta}
        </Link>
        <div>
          <p className="mb-2 text-center text-xs text-[var(--study-muted)]">{t.profile.language}</p>
          <StudyLanguageSwitcher />
        </div>
        <p className="text-center text-xs text-[var(--study-muted)]">{t.landing.footnote}</p>
      </div>
    </StudyShell>
  );
}
