import type { Metadata } from "next";
import Link from "next/link";
import { KfLegalPageShell } from "@/components/kasifind/kf-legal-page-shell";
import {
  KF_SUPPORT_EMAIL,
  KF_SUPPORT_WHATSAPP_DISPLAY,
  kfSupportMailtoUrl,
} from "@/lib/kasifind/support-contact";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How KasiFind collects, uses and protects personal information on this South African local business discovery platform (POPIA-aware).",
};

export default function PrivacyPage() {
  return (
    <KfLegalPageShell title="Privacy Policy">
      <p className="text-sm text-[var(--kf-muted)]">
        Last updated: November 2026. This policy describes how KasiFind handles personal information in
        line with the Protection of Personal Information Act, 2013 (POPIA) and related South African
        expectations. It should be reviewed by a qualified legal professional before being treated as
        final.
      </p>

      <h2>Who we are</h2>
      <p>
        KasiFind is operated by Henry Vogel as a sole proprietorship in South Africa. For privacy
        enquiries, contact us using the details at the end of this policy. We have{" "}
        <strong>not</strong> verified or documented a formally appointed Information Officer under POPIA
        on this platform; if that is required for our operations, it must be addressed separately.
      </p>

      <h2>What information KasiFind collects</h2>
      <p>Depending on how you use KasiFind, we may process:</p>
      <ul>
        <li>
          <strong>Provider account information</strong> — email address, optional display name, password
          (stored as a secure hash, not plain text), account role, and timestamps such as when the
          account was created or last seen.
        </li>
        <li>
          <strong>Business listing information</strong> — trading name, description, phone number,
          optional WhatsApp number, location label, map coordinates, optional price hints and hours notes,
          service names, photos, and category selections. Published listings are visible to the public.
        </li>
        <li>
          <strong>Community reviews</strong> — star rating, review text, optional author name, and
          linkage to a logged-in user when the reviewer is signed in.
        </li>
        <li>
          <strong>Reports and moderation</strong> — if you report a listing, we store the report details
          you submit for moderation.
        </li>
        <li>
          <strong>Usage analytics</strong> — event types such as search, listing impressions, profile
          views, contact button taps, and category browsing; optional search query text and a general
          region label supplied by the app; listing and category identifiers where relevant.
        </li>
        <li>
          <strong>Anonymous visitor identifier</strong> — a random ID in an httpOnly cookie (
          <code>kf_vid</code>) used to correlate analytics events before or without sign-in.
        </li>
        <li>
          <strong>Session cookie</strong> — when you sign in, an httpOnly session cookie (
          <code>kf_session</code>) keeps you logged in for up to 30 days.
        </li>
      </ul>

      <h2>Location information</h2>
      <p>
        KasiFind can use your location to show nearby businesses when you choose GPS-based discovery or
        pick an area on the map. Location is handled as follows:
      </p>
      <ul>
        <li>
          <strong>Browser permission</strong> — if you allow location access, coordinates are used in your
          browser to search and sort results. You can also search by area name or browse without sharing
          GPS.
        </li>
        <li>
          <strong>On your device</strong> — search preferences and last chosen area may be stored in{" "}
          <strong>sessionStorage</strong> for the browsing session. Your location consent choice may be
          stored in <strong>localStorage</strong> so we do not repeatedly prompt you.
        </li>
        <li>
          <strong>On our servers</strong> — listing addresses and coordinates are stored as part of
          provider listings. When you run a search, latitude and longitude are sent to our search API to
          compute distance; we do not operate a separate long-term “customer GPS history” database based
          on the current application code. Analytics events may include a general{" "}
          <strong>region label</strong> (for example a suburb or “Nationwide (no location)”) rather than
          precise visitor coordinates.
        </li>
        <li>
          <strong>Hidden exact pin</strong> — providers may hide their exact map pin; in that case a
          rounded approximate location may be shown publicly.
        </li>
      </ul>

      <h2>How we use information</h2>
      <ul>
        <li>Operating the directory, search, maps and provider tools.</li>
        <li>Moderating listings and reviews.</li>
        <li>Understanding aggregate usage to improve the platform (first-party analytics).</li>
        <li>Security, fraud prevention and troubleshooting.</li>
        <li>Responding to support and privacy requests.</li>
      </ul>

      <h2>Cookies and similar technologies</h2>
      <ul>
        <li>
          <strong>kf_session</strong> — authentication (httpOnly, up to 30 days).
        </li>
        <li>
          <strong>kf_vid</strong> — anonymous analytics visitor ID (httpOnly, up to 12 months).
        </li>
        <li>
          <strong>sessionStorage / localStorage</strong> — discovery filters and location consent (on
          your device only; not sent to us as a bulk export).
        </li>
      </ul>
      <p>
        We do not use third-party advertising cookies in the current KasiFind application code. Map
        tiles and geocoding may request data from{" "}
        <strong>OpenStreetMap / Nominatim</strong> when you use map or place-search features; those
        services have their own policies.
      </p>

      <h2>Sharing with third parties</h2>
      <p>
        Public listing information is visible to anyone using KasiFind. When you tap WhatsApp, call or
        directions on a listing, you leave KasiFind and interact with your device&apos;s apps or external
        services (for example WhatsApp or map providers).
      </p>
      <p>
        We host the application and database on infrastructure we configure for KasiFind. We do not sell
        personal information. We may disclose information if required by law or to protect rights and
        safety.
      </p>

      <h2>Storage and security</h2>
      <p>
        Data is stored in a PostgreSQL database and, for photos, on server storage configured for the
        deployment. Passwords are hashed. Session and visitor cookies are httpOnly. We take reasonable
        steps to protect information, but no online system can be guaranteed 100% secure.
      </p>

      <h2>Retention</h2>
      <p>
        Account and listing data is kept while your account and listings remain active, and as needed for
        moderation, legal or backup purposes. Analytics events are retained in the database for
        operational reporting unless we implement a specific deletion schedule. You may request deletion
        subject to the section below and any legal retention obligations.
      </p>

      <h2>Your rights under POPIA</h2>
      <p>
        Where POPIA applies, you may have rights to request access to, correction of, or deletion of
        personal information we hold about you, and to object to certain processing in permitted
        circumstances. We will respond to valid requests within a reasonable time.
      </p>
      <p>
        Providers can update much of their listing information by signing in. For other requests, contact
        us with enough detail to identify your account or listing.
      </p>

      <h2>Privacy contact</h2>
      <ul>
        <li>
          Email:{" "}
          <a href={kfSupportMailtoUrl("KasiFind privacy request")} className="kf-link underline">
            {KF_SUPPORT_EMAIL}
          </a>
        </li>
        <li>WhatsApp: {KF_SUPPORT_WHATSAPP_DISPLAY}</li>
      </ul>

      <div className="kf-legal-notice mt-8">
        <h2 className="text-base">Compliance note</h2>
        <p className="text-sm">
          Publishing this policy is an important transparency step but <strong>does not by itself</strong>{" "}
          establish full POPIA compliance. Items that may still need professional review include: formal
          Information Officer appointment where required, records of processing activities, operator
          agreements with hosting providers, retention schedules, data breach procedures, and direct
          marketing consent if introduced later.
        </p>
      </div>

      <p className="mt-6 text-sm">
        General support:{" "}
        <Link href="/contact" className="kf-link underline">
          Contact & Support
        </Link>
        .
      </p>
    </KfLegalPageShell>
  );
}
