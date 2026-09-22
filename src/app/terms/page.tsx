import { LegalDocumentLayout } from "@/components/legal/legal-document-layout";
import { TermsDocument } from "@/content/legal/policy-documents";
import { POLICY_EFFECTIVE_DATE, POLICY_VERSIONS } from "@/lib/legal/policy-meta";
import { formatPolicyDate } from "@/lib/legal/format-date";

export const metadata = {
  title: "Terms of Use",
  description: "InstallBase Terms of Use and Terms & Conditions.",
};

export default function TermsPage() {
  return (
    <LegalDocumentLayout
      title="Terms of Use"
      version={POLICY_VERSIONS.TERMS}
      effectiveDate={formatPolicyDate(POLICY_EFFECTIVE_DATE)}
    >
      <TermsDocument />
    </LegalDocumentLayout>
  );
}
