import { LegalDocumentLayout } from "@/components/legal/legal-document-layout";
import { PrivacyDocument } from "@/content/legal/policy-documents";
import { POLICY_EFFECTIVE_DATE, POLICY_VERSIONS } from "@/lib/legal/policy-meta";
import { formatPolicyDate } from "@/lib/legal/format-date";

export const metadata = {
  title: "Privacy Policy",
  description: "InstallBase Privacy Policy (POPIA).",
};

export default function PrivacyPage() {
  return (
    <LegalDocumentLayout
      title="Privacy Policy"
      version={POLICY_VERSIONS.PRIVACY}
      effectiveDate={formatPolicyDate(POLICY_EFFECTIVE_DATE)}
    >
      <PrivacyDocument />
    </LegalDocumentLayout>
  );
}
