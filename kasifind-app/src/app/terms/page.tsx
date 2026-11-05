import type { Metadata } from "next";
import Link from "next/link";
import { KfLegalPageShell } from "@/components/kasifind/kf-legal-page-shell";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of use for KasiFind, a South African platform for discovering local businesses and service providers.",
};

export default function TermsPage() {
  return (
    <KfLegalPageShell title="Terms of Service">
      <p className="text-sm text-[var(--kf-muted)]">
        Last updated: November 2026. These terms are written for a South African audience and should be
        reviewed by a qualified legal professional before being treated as final.
      </p>

      <h2>Platform purpose</h2>
      <p>
        KasiFind provides an online directory and discovery platform for local businesses and independent
        service providers in South Africa. KasiFind is <strong>not</strong> the provider of the goods or
        services advertised in listings. Contracts, pricing, quality and delivery are between customers
        and the listed business.
      </p>

      <h2>Business listings</h2>
      <ul>
        <li>Providers are responsible for the accuracy of their listing information.</li>
        <li>
          Providers must have permission to publish the information, photographs and other content they
          submit.
        </li>
        <li>
          Listings must not contain fraudulent, misleading, illegal or otherwise prohibited content.
        </li>
        <li>KasiFind may remove or disable listings that violate these terms or platform rules.</li>
        <li>Providers must keep contact details and service information reasonably up to date.</li>
      </ul>

      <h2>One listing per account</h2>
      <p>
        Each provider account is intended for <strong>one business listing</strong>. Providers should not
        create multiple accounts to bypass this restriction or to publish duplicate listings for the same
        business. KasiFind may merge, restrict or remove accounts that abuse this rule.
      </p>

      <h2>Customer interactions</h2>
      <ul>
        <li>Customers contact businesses directly (for example by phone or WhatsApp).</li>
        <li>Customers should independently verify providers before engaging their services.</li>
        <li>
          KasiFind does not guarantee the quality, reliability, pricing, availability or conduct of any
          listed provider.
        </li>
        <li>Ratings and reviews should be honest and based on genuine experiences.</li>
        <li>
          KasiFind may moderate, hide or remove reviews that appear fraudulent, abusive or inappropriate.
        </li>
      </ul>

      <h2>Free listings</h2>
      <p>
        Basic business listings are currently offered at no charge. KasiFind may introduce optional paid
        features or change pricing in future. If that happens, we will communicate changes clearly before
        they apply to you.
      </p>

      <h2>Platform availability</h2>
      <p>
        We aim to keep KasiFind available and useful, but we do not guarantee uninterrupted or error-free
        access. Maintenance, updates or circumstances outside our control may affect availability.
      </p>

      <h2>Suspension and termination</h2>
      <p>
        KasiFind may suspend or terminate accounts or listings where we reasonably believe there has been
        abuse, fraud, repeated policy violations, legal risk or harm to other users. Providers may stop
        using the platform at any time; published listings may be withdrawn or disabled on request where
        reasonably practicable.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the extent permitted by South African law, KasiFind is not liable for indirect or consequential
        loss arising from use of the platform or from dealings with listed businesses. Nothing in these
        terms excludes liability that cannot be excluded under applicable law (including where applicable
        the Consumer Protection Act or other mandatory protections).
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms from time to time. Material changes will be posted on this page with an
        updated date. Continued use of KasiFind after changes take effect constitutes acceptance of the
        updated terms, unless applicable law requires a different approach.
      </p>

      <h2>Applicable law</h2>
      <p>These terms are governed by the laws of the Republic of South Africa.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms: see our{" "}
        <Link href="/contact" className="kf-link underline">
          Contact & Support
        </Link>{" "}
        page.
      </p>
    </KfLegalPageShell>
  );
}
