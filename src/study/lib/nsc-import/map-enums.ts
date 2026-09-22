import {
  StudyNscExamSession,
  StudyOfficialVerificationStatus,
} from "@/generated/prisma/client";
import type { NscImportBatchFile } from "@/study/lib/nsc-import/types";

export function mapExamSession(session: NscImportBatchFile["paper"]["examSession"]): StudyNscExamSession {
  switch (session) {
    case "november":
      return StudyNscExamSession.NOVEMBER;
    case "may_june":
      return StudyNscExamSession.MAY_JUNE;
    case "supplementary":
      return StudyNscExamSession.SUPPLEMENTARY;
    default:
      return StudyNscExamSession.OTHER;
  }
}

export function mapVerificationStatus(
  status: NscImportBatchFile["verification"]["status"],
): StudyOfficialVerificationStatus {
  switch (status) {
    case "draft":
      return StudyOfficialVerificationStatus.DRAFT;
    case "verified":
      return StudyOfficialVerificationStatus.VERIFIED;
    case "rejected":
      return StudyOfficialVerificationStatus.REJECTED;
    default:
      return StudyOfficialVerificationStatus.PENDING_REVIEW;
  }
}
