import { LegalDocumentLayout } from "@/components/legal/legal-document-layout";
import { CommunityGuidelinesDocument } from "@/content/legal/policy-documents";
import { POLICY_EFFECTIVE_DATE, POLICY_VERSIONS } from "@/lib/legal/policy-meta";
import { formatPolicyDate } from "@/lib/legal/format-date";

export const metadata = {
  title: "Community Guidelines",
  description: "InstallBase Community Guidelines for installers.",
};

export default function CommunityGuidelinesPage() {
  return (
    <LegalDocumentLayout
      title="Community Guidelines"
      version={POLICY_VERSIONS.COMMUNITY_GUIDELINES}
      effectiveDate={formatPolicyDate(POLICY_EFFECTIVE_DATE)}
    >
      <CommunityGuidelinesDocument />
    </LegalDocumentLayout>
  );
}
