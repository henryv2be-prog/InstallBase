import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { OnboardingWizard } from "@/study/components/onboarding-wizard";
import { StudyLanguageSwitcher } from "@/study/components/study-language-switcher";
import { StudyShell } from "@/study/components/study-shell";
import { getStudyMessages } from "@/study/i18n/get-locale";
import { getStudyLearnerForRequest, isLearnerOnboarded } from "@/study/lib/learner-session";
import { GRADE_12_SUBJECT_BY_SLUG } from "@/study/data/grade-12-subject-catalog";
import { ensureStudyCatalog } from "@/study/lib/ensure-catalog";
import { getStudySubjectsForOnboarding } from "@/study/lib/queries";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ edit?: string }> };

export default async function StudyOnboardingPage({ searchParams }: Props) {
  const { edit } = await searchParams;
  const [{ t }, learner, session] = await Promise.all([
    getStudyMessages(),
    getStudyLearnerForRequest(),
    getSession(),
  ]);
  const isEdit = edit === "1";
  if (isLearnerOnboarded(learner) && !isEdit) {
    redirect("/study/dashboard");
  }

  const defaultName =
    learner?.displayName?.trim() ||
    session?.user?.name?.trim() ||
    session?.user?.email?.split("@")[0] ||
    "";

  let subjects: Awaited<ReturnType<typeof getStudySubjectsForOnboarding>> = [];
  try {
    await ensureStudyCatalog();
    subjects = await getStudySubjectsForOnboarding();
  } catch {
    subjects = [];
  }

  const options = subjects.map((s) => ({
    id: s.id,
    slug: s.slug,
    name: s.name,
    hasCurriculum: s.curricula.length > 0,
    category: GRADE_12_SUBJECT_BY_SLUG[s.slug]?.category ?? "services",
  }));

  return (
    <StudyShell
      backHref={isEdit ? "/study/profile" : "/study"}
      backLabel={isEdit ? t.nav.profile : t.common.back}
    >
      {!session?.user ? (
        <p className="mb-4 text-xs leading-relaxed text-[var(--study-muted)]">
          {t.onboarding.signInHint}{" "}
          <Link href="/login?next=/study/onboarding" className="text-[#c7d2fe] underline">
            {t.onboarding.signInLink}
          </Link>{" "}
          {t.onboarding.signInRest}
        </p>
      ) : null}
      <section className="mb-5">
        <p className="study-section-label mb-1">{t.profile.language}</p>
        <StudyLanguageSwitcher />
      </section>
      {options.length === 0 ? (
        <div className="study-card p-5 text-sm text-[var(--study-muted)]">
          {t.onboarding.subjectsMissing}
        </div>
      ) : (
        <OnboardingWizard
          subjects={options}
          initialName={defaultName}
          initialMarks={
            learner?.subjects.length
              ? Object.fromEntries(
                  options.map((opt) => {
                    const row = learner.subjects.find((s) => s.subjectId === opt.id);
                    return [
                      opt.id,
                      row
                        ? {
                            selected: true,
                            currentMarkPct: row.currentMarkPct,
                            targetMarkPct: row.targetMarkPct,
                          }
                        : {
                            selected: false,
                            currentMarkPct: 55,
                            targetMarkPct: 70,
                          },
                    ];
                  }),
                )
              : undefined
          }
          initialExams={
            learner?.subjects.length
              ? Object.fromEntries(
                  learner.subjects.flatMap((ls) => {
                    const exam = ls.exams[0];
                    if (!exam) return [];
                    return [
                      [
                        ls.subjectId,
                        {
                          examAt: exam.examAt.toISOString().slice(0, 10),
                          paperNumber: String(exam.paperNumber ?? 1),
                          durationMinutes: String(exam.durationMinutes ?? 180),
                        },
                      ],
                    ];
                  }),
                )
              : undefined
          }
        />
      )}
    </StudyShell>
  );
}
