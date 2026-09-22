"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { STUDY_LEARNER_COOKIE } from "@/study/lib/constants";
import { studyOnboardingSchema, type StudyOnboardingInput } from "@/study/lib/validation";
import {
  deleteMasteriesForSubject,
  initializeLearnerMasteries,
} from "@/study/lib/initialize-masteries";
import { rollupDemonstratedMarksForLearner } from "@/study/lib/rollup-subject-demonstrated-mark";

export type StudyActionResult =
  | { ok: true; learnerId: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function completeStudyOnboarding(raw: StudyOnboardingInput): Promise<StudyActionResult> {
  const parsed = studyOnboardingSchema.safeParse(raw);
  if (!parsed.success) {
    const flat = parsed.error.flatten();
    return {
      ok: false,
      error: flat.formErrors[0] ?? "Please check your answers",
      fieldErrors: flat.fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const session = await getSession();
  const userId = session?.user?.id ?? null;

  try {
    const cookieStore = await cookies();
    const existingCookieId = cookieStore.get(STUDY_LEARNER_COOKIE)?.value;

    let learnerId: string;

    const existing =
      (userId
        ? await prisma.studyLearner.findUnique({ where: { userId } })
        : null) ??
      (existingCookieId
        ? await prisma.studyLearner.findUnique({ where: { id: existingCookieId } })
        : null);

    if (existing) {
      learnerId = existing.id;
      await prisma.studyLearner.update({
        where: { id: learnerId },
        data: {
          displayName: data.basics.displayName,
          grade: 12,
          schoolYear: data.basics.schoolYear,
          defaultAvailableMinutes: data.basics.defaultAvailableMinutes,
          userId: userId ?? existing.userId,
          onboardedAt: new Date(),
        },
      });
      const incomingSubjectIds = new Set(data.subjects.map((s) => s.subjectId));
      const currentSubjects = await prisma.studyLearnerSubject.findMany({
        where: { learnerId },
        select: { subjectId: true },
      });
      for (const row of currentSubjects) {
        if (!incomingSubjectIds.has(row.subjectId)) {
          await deleteMasteriesForSubject(learnerId, row.subjectId);
        }
      }

      await prisma.studyExam.deleteMany({
        where: { learnerSubject: { learnerId } },
      });
      await prisma.studyLearnerSubject.deleteMany({ where: { learnerId } });
    } else {
      const created = await prisma.studyLearner.create({
        data: {
          displayName: data.basics.displayName,
          grade: 12,
          schoolYear: data.basics.schoolYear,
          defaultAvailableMinutes: data.basics.defaultAvailableMinutes,
          userId,
          onboardedAt: new Date(),
        },
      });
      learnerId = created.id;
    }

    for (const sub of data.subjects) {
      const learnerSubject = await prisma.studyLearnerSubject.create({
        data: {
          learnerId,
          subjectId: sub.subjectId,
          currentMarkPct: sub.currentMarkPct,
          targetMarkPct: sub.targetMarkPct,
        },
      });

      const exam = data.exams.find((e) => e.subjectId === sub.subjectId);
      if (exam) {
        await prisma.studyExam.create({
          data: {
            learnerSubjectId: learnerSubject.id,
            examAt: new Date(`${exam.examAt}T12:00:00.000Z`),
            paperNumber: exam.paperNumber ?? null,
            durationMinutes: exam.durationMinutes ?? null,
          },
        });
      }
    }

    await initializeLearnerMasteries(learnerId, data.subjects);
    await rollupDemonstratedMarksForLearner(learnerId);

    cookieStore.set(STUDY_LEARNER_COOKIE, learnerId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    revalidatePath("/study");
    revalidatePath("/study/dashboard");
    revalidatePath("/study/onboarding");
    revalidatePath("/study/profile");
    revalidatePath("/study/subjects");
    revalidatePath("/study/practice");

    return { ok: true, learnerId };
  } catch (e) {
    console.error("completeStudyOnboarding", e);
    return { ok: false, error: "Could not save your profile. Try again." };
  }
}
