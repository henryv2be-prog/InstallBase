import { LegalDocumentLayout } from "@/components/legal/legal-document-layout";
import { CookiesDocument } from "@/content/legal/policy-documents";
import { POLICY_EFFECTIVE_DATE, POLICY_VERSIONS } from "@/lib/legal/policy-meta";
import { formatPolicyDate } from "@/lib/legal/format-date";

export const metadata = {
  title: "Cookie Policy",
  description: "InstallBase cookie and storage policy.",
};

export default function CookiesPage() {
  return (
    <LegalDocumentLayout
      title="Cookie Policy"
      version={POLICY_VERSIONS.COOKIES}
      effectiveDate={formatPolicyDate(POLICY_EFFECTIVE_DATE)}
    >
      <CookiesDocument />
    </LegalDocumentLayout>
  );
}
