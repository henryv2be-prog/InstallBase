import { z } from "zod";

export const nscExamSessionSchema = z.enum(["november", "may_june", "supplementary", "other"]);

export const nscVerificationSchema = z.enum(["draft", "pending_review", "verified", "rejected"]);

export const nscImportQuestionSchema = z.object({
  sourceQuestionRef: z.string().min(1),
  topicSlug: z.string().min(1),
  subtopicSlug: z.string().min(1),
  type: z.enum(["MULTIPLE_CHOICE", "SHORT_ANSWER"]),
  difficulty: z.number().int().min(1).max(5).default(3),
  prompt: z.string().min(1),
  options: z.array(z.object({ id: z.string(), text: z.string() })).default([]),
  correctOptionId: z.string().optional().default(""),
  correctAnswerText: z.string().optional(),
  acceptableAnswers: z.array(z.string()).optional(),
  explanation: z.string().optional(),
});

export const nscImportBatchSchema = z.object({
  batchSlug: z.string().regex(/^[a-z0-9-]+$/),
  label: z.string().min(1),
  sourceDocumentTitle: z.string().min(1),
  verification: z.object({
    status: nscVerificationSchema,
    verifiedAt: z.string().optional(),
    notes: z.string().optional(),
  }),
  paper: z.object({
    subjectSlug: z.string().min(1),
    examYear: z.number().int().min(2008).max(2035),
    examSession: nscExamSessionSchema,
    paperNumber: z.number().int().min(1).max(3),
    title: z.string().min(1),
    questionPaperUrl: z.string().url().optional(),
    memorandumUrl: z.string().url().optional(),
    dbePortalUrl: z.string().url(),
  }),
  questions: z.array(nscImportQuestionSchema).min(1),
});

export type NscImportBatchFile = z.infer<typeof nscImportBatchSchema>;

export const nscImportManifestSchema = z.object({
  schemaVersion: z.literal(1),
  batches: z.array(z.string().min(1)),
});

export type NscImportManifest = z.infer<typeof nscImportManifestSchema>;
