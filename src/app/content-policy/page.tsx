import { LegalDocumentLayout } from "@/components/legal/legal-document-layout";
import { ContentPolicyDocument } from "@/content/legal/policy-documents";
import { POLICY_EFFECTIVE_DATE, POLICY_VERSIONS } from "@/lib/legal/policy-meta";
import { formatPolicyDate } from "@/lib/legal/format-date";

export const metadata = {
  title: "Content, Copyright & Takedown",
  description: "InstallBase content, copyright and takedown policy.",
};

export default function ContentPolicyPage() {
  return (
    <LegalDocumentLayout
      title="Content, Copyright & Takedown Policy"
      version={POLICY_VERSIONS.CONTENT_POLICY}
      effectiveDate={formatPolicyDate(POLICY_EFFECTIVE_DATE)}
    >
      <ContentPolicyDocument />
    </LegalDocumentLayout>
  );
}
