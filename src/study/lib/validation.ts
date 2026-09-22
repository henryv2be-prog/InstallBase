import { z } from "zod";

export const studyBasicsSchema = z.object({
  displayName: z.string().trim().min(2, "Enter your name").max(80),
  schoolYear: z.coerce.number().int().min(2026).max(2027).default(2026),
  defaultAvailableMinutes: z.coerce.number().int().min(15).max(240).default(45),
});

export const studySubjectMarksSchema = z.object({
  subjectId: z.string().min(1),
  currentMarkPct: z.coerce.number().min(0).max(100),
  targetMarkPct: z.coerce.number().min(0).max(100),
});

export const studyExamSchema = z.object({
  subjectId: z.string().min(1),
  examAt: z.string().min(1, "Pick an exam date"),
  paperNumber: z.coerce.number().int().min(1).max(3).optional().nullable(),
  durationMinutes: z.coerce.number().int().min(30).max(240).optional().nullable(),
});

export const studyOnboardingSchema = z
  .object({
    basics: studyBasicsSchema,
    subjects: z.array(studySubjectMarksSchema).min(1, "Choose at least one subject"),
    exams: z.array(studyExamSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const subjectIds = new Set(data.subjects.map((s) => s.subjectId));
    for (const sub of data.subjects) {
      if (sub.targetMarkPct < sub.currentMarkPct) {
        ctx.addIssue({
          code: "custom",
          message: "Target should be at or above your current estimate",
          path: ["subjects"],
        });
        break;
      }
    }
    for (const exam of data.exams) {
      if (!subjectIds.has(exam.subjectId)) {
        ctx.addIssue({
          code: "custom",
          message: "Exam subjects must match your selected subjects",
          path: ["exams"],
        });
        break;
      }
    }
    const examIds = new Set(data.exams.map((e) => e.subjectId));
    for (const id of subjectIds) {
      if (!examIds.has(id)) {
        ctx.addIssue({
          code: "custom",
          message: "Add an exam date for each subject",
          path: ["exams"],
        });
        break;
      }
    }
  });

export type StudyOnboardingInput = z.infer<typeof studyOnboardingSchema>;
