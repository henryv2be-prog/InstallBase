import Link from "next/link";
import { LEGAL_SITE } from "@/lib/legal/site-config";

export function TermsDocument() {
  return (
    <>
      <h2>1. About InstallBase</h2>
      <p>
        {LEGAL_SITE.platformName} is a social platform for installation and technical professionals,
        primarily serving users in {LEGAL_SITE.governingLawCountry} and internationally. These Terms of
        Use govern your access to and use of the platform operated by {LEGAL_SITE.legalEntityName}{" "}
        (&quot;we&quot;, &quot;us&quot;, &quot;InstallBase&quot;).
      </p>

      <h2>2. Eligibility and accounts</h2>
      <p>
        You must be at least 18 years old (or the age of majority in your jurisdiction, if higher) to
        create an account. You agree to provide accurate registration information and to keep your
        account details up to date. You are responsible for safeguarding your password and for all
        activity under your account.
      </p>

      <h2>3. Your content</h2>
      <p>
        You retain ownership of photos, videos, text and other content you upload (&quot;User
        Content&quot;). You confirm that you have the necessary rights, licences or permissions to
        publish User Content on InstallBase, including where content shows installation work, customer
        sites, employers, colleagues or third parties.
      </p>
      <p>
        You grant InstallBase a non-exclusive, worldwide, royalty-free licence to host, store,
        reproduce, resize, adapt for display, distribute within the platform, and reasonably promote
        User Content solely as needed to operate, improve and market the service (for example feed
        display, profiles, notifications and platform marketing that features public posts). This
        licence ends when content is deleted from our systems, except where retention is required by
        law, for backups, dispute resolution, or enforcement of these Terms.
      </p>
      <p>
        InstallBase does not claim ownership of your photographs or videos. We do not automatically
        treat content as owned by an employer, customer or another user simply because it depicts their
        premises or project.
      </p>

      <h2>4. Workplace, confidentiality and security</h2>
      <p>
        You are responsible for what you post. Do not upload passwords, alarm or access codes,
        credentials, keys, customer databases, ID documents, confidential employer or client
        information, or sensitive network or security details unless you are clearly authorised to
        share them publicly. Disputes between you and an employer, customer or contractor regarding
        permission to publish content are your responsibility; InstallBase is not a party to those
        relationships.
      </p>

      <h2>5. Acceptable use</h2>
      <p>You must not use InstallBase to:</p>
      <ul>
        <li>Harass, threaten, defame or discriminate against others;</li>
        <li>Post spam, scams, fraudulent or impersonation content;</li>
        <li>Upload illegal content or content that violates applicable law;</li>
        <li>Attempt to compromise platform security or other users&apos; accounts;</li>
        <li>Abuse reporting, moderation or ranking systems.</li>
      </ul>

      <h2>6. Reporting, moderation and enforcement</h2>
      <p>
        Users may report content or accounts using the in-app Report function. We may review reports,
        request information, restrict visibility, remove content, suspend or terminate accounts where we
        reasonably believe this is necessary to protect users, comply with law or enforce these Terms
        and our{" "}
        <Link href="/community-guidelines">Community Guidelines</Link> and{" "}
        <Link href="/content-policy">Content Policy</Link>. We are not obliged to monitor all content.
        Where appropriate, you may contact us to request review of an enforcement action.
      </p>

      <h2>7. Third-party services</h2>
      <p>
        The platform may link to third-party websites or services. We are not responsible for their
        content or practices. Optional sign-in providers (such as Google, if enabled) are governed by
        their own terms and privacy policies.
      </p>

      <h2>8. Availability and disclaimers</h2>
      <p>
        We strive to keep InstallBase available but do not guarantee uninterrupted or error-free
        service. Content and advice shared by users are not professional advice from InstallBase. To
        the extent permitted by South African law, the platform is provided &quot;as is&quot; and we
        disclaim warranties not expressly stated in these Terms.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by applicable law in {LEGAL_SITE.governingLawCountry},
        InstallBase and its operators will not be liable for indirect, incidental or consequential
        damages arising from your use of the platform. Our aggregate liability for claims relating to
        the service is limited to the greater of (a) amounts you paid us in the twelve months before
        the claim or (b) ZAR 500, except where liability cannot be limited by law.
      </p>

      <h2>10. Changes</h2>
      <p>
        We may update the service and these Terms. When we publish a new version, we will update the
        version number and effective date. Continued use after you have accepted the updated Terms
        constitutes agreement; where required, we will ask you to accept the new version before
        continued use.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of the Republic of {LEGAL_SITE.governingLawCountry}.
        Disputes are subject to the jurisdiction of the courts of{" "}
        {LEGAL_SITE.governingLawCountry}, unless mandatory consumer protections in your country
        require otherwise.
      </p>

      <h2>12. Contact</h2>
      <p>
        General enquiries: {LEGAL_SITE.generalContactEmail}. Privacy-related enquiries:{" "}
        {LEGAL_SITE.privacyContactEmail}.
      </p>
    </>
  );
}

export function PrivacyDocument() {
  return (
    <>
      <h2>1. Introduction</h2>
      <p>
        This Privacy Policy explains how {LEGAL_SITE.platformName} processes personal information in
        accordance with the Protection of Personal Information Act, 2013 (POPIA) and other applicable
        law in {LEGAL_SITE.governingLawCountry}. The responsible party is {LEGAL_SITE.legalEntityName}.
      </p>

      <h2>2. Information we collect</h2>
      <p>Based on how the platform currently works, we may collect:</p>
      <ul>
        <li>
          <strong>Account data:</strong> name, email address, password (stored as a hash), username,
          profile details (bio, city, country, specialties, experience, certifications you choose to
          list, profile and cover images).
        </li>
        <li>
          <strong>User-generated content:</strong> posts, photos, videos, comments, messages, brag
          points you give or receive, and related metadata (timestamps, locations you choose to
          attach).
        </li>
        <li>
          <strong>Usage and device data:</strong> IP address and request metadata in server logs;
          optional anonymous page-view analytics (page key, device type, session-scoped viewer key in
          session storage); last-seen timestamps for presence features.
        </li>
        <li>
          <strong>Notifications:</strong> if you enable web push, push subscription endpoints and
          related keys stored for your account; optional user-agent string on push subscriptions.
        </li>
        <li>
          <strong>Moderation:</strong> reports you submit, descriptions, and moderation outcomes.
        </li>
        <li>
          <strong>Policy acceptance:</strong> policy version accepted, timestamp, and optionally IP
          address and browser user-agent string when you accept policies.
        </li>
      </ul>

      <h2>3. How we use information</h2>
      <p>We use personal information to:</p>
      <ul>
        <li>Provide authentication, profiles, feeds, messaging and notifications;</li>
        <li>Operate reputation, brag points and discovery features;</li>
        <li>Process media uploads and optional install-video compilation;</li>
        <li>Secure the platform, prevent abuse and enforce policies;</li>
        <li>Send service notifications and optional daily re-engagement emails where enabled;</li>
        <li>Measure aggregated landing-page and advertising analytics where enabled;</li>
        <li>Comply with legal obligations.</li>
      </ul>

      <h2>4. Sharing</h2>
      <p>
        Public profile and post information is visible to other users according to your settings and
        platform design. We use infrastructure and hosting providers (for example cloud hosting where
        the application is deployed) to store and deliver the service. We do not sell personal
        information. We may disclose information if required by law or to protect rights, safety and
        security.
      </p>

      <h2>5. Security and retention</h2>
      <p>
        We apply reasonable technical and organisational measures appropriate to a growing platform.
        No system is perfectly secure. We retain information while your account is active and as
        needed for backups, legal compliance and dispute resolution, then delete or anonymise where
        appropriate.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Under POPIA you may request access, correction or deletion of personal information, object to
        certain processing, or lodge a complaint with the Information Regulator (South Africa). Contact{" "}
        {LEGAL_SITE.privacyContactEmail} to exercise these rights. You may delete your account via
        settings or by contacting us where self-service deletion is unavailable.
      </p>

      <h2>7. Cross-border processing</h2>
      <p>
        Data may be processed on servers located outside {LEGAL_SITE.governingLawCountry} where our
        hosting providers operate. We take steps to ensure appropriate safeguards where required.
      </p>

      <h2>8. Contact</h2>
      <p>Privacy enquiries: {LEGAL_SITE.privacyContactEmail}.</p>
    </>
  );
}

export function CommunityGuidelinesDocument() {
  return (
    <>
      <h2>Welcome</h2>
      <p>
        InstallBase is where installers show real work, learn from each other and build reputation.
        These guidelines are plain-language rules for participating safely and professionally.
      </p>

      <h2>Share helpful installation content</h2>
      <p>Great posts include:</p>
      <ul>
        <li>Completed installations and work in progress;</li>
        <li>Before/after photos, rack builds, cabling, commissioning and testing;</li>
        <li>Short videos demonstrating techniques or finished systems;</li>
        <li>Technical tips, lessons learned and professional knowledge;</li>
        <li>Content you are allowed to publish — see below.</li>
      </ul>

      <h2>Permission and responsibility</h2>
      <p>
        <strong>You are responsible for making sure you may publish what you upload.</strong> That
        may depend on your contract, site rules, customer instructions or local law. InstallBase does
        not decide who owns a photo or video — circumstances differ. When in doubt, get permission
        before posting identifiable sites, people or confidential details.
      </p>

      <h2>Never post</h2>
      <ul>
        <li>Passwords, alarm codes, access codes or credentials;</li>
        <li>Keys, tokens or security bypass information;</li>
        <li>Customer databases, ID documents or sensitive personal information;</li>
        <li>Confidential employer, client or supplier information;</li>
        <li>Network diagrams or details that expose security weaknesses without authorisation;</li>
        <li>Harassment, threats, hate or targeted abuse;</li>
        <li>Spam, scams, impersonation or fake accounts;</li>
        <li>Illegal content.</li>
      </ul>

      <h2>Be professional</h2>
      <p>
        Debate ideas, not people. Use the Report function if something violates these guidelines.
        Repeated or serious violations may lead to content removal or account suspension.
      </p>
    </>
  );
}

export function ContentPolicyDocument() {
  return (
    <>
      <h2>1. Purpose</h2>
      <p>
        This policy explains how {LEGAL_SITE.platformName} handles user content, copyright concerns
        and takedown requests. It works together with our{" "}
        <Link href="/terms">Terms of Use</Link> and{" "}
        <Link href="/community-guidelines">Community Guidelines</Link>.
      </p>

      <h2>2. Your responsibility</h2>
      <p>
        Uploaders are responsible for their content. InstallBase hosts and displays content uploaded
        by users; we do not automatically verify ownership simply because someone claims a post shows
        &quot;their work&quot; or a project they manage.
      </p>

      <h2>3. Submitting a complaint</h2>
      <p>
        To raise a copyright, privacy, confidentiality or other content concern, use the{" "}
        <strong>Report</strong> option on the relevant post or profile in the app. Choose the reason
        that best fits (for example copyright, privacy, confidential information, security-sensitive
        content, harassment, spam or illegal content) and provide:
      </p>
      <ul>
        <li>A link or clear identification of the specific content;</li>
        <li>A concise explanation of your concern;</li>
        <li>Contact details so we can follow up if needed.</li>
      </ul>
      <p>
        We may request additional information or evidence. Submitting a report does not automatically
        remove content.
      </p>

      <h2>4. Our process</h2>
      <p>
        We review reports in good faith. We may temporarily restrict visibility, label content, contact
        the uploader, or remove content where we reasonably determine that is appropriate. We may
        restore content if a complaint is withdrawn or not substantiated. InstallBase does not act as
        a court and does not make final legal determinations about copyright ownership; serious
        disputes may need to be resolved between the parties or through legal process.
      </p>

      <h2>5. Cooperation</h2>
      <p>
        Uploaders and complainants must cooperate honestly with moderation requests. Abuse of the
        reporting system may lead to account action.
      </p>

      <h2>6. Contact</h2>
      <p>
        If you cannot use the in-app Report flow, contact {LEGAL_SITE.generalContactEmail} with the
        same details listed above.
      </p>
    </>
  );
}

export function CookiesDocument() {
  return (
    <>
      <h2>1. Overview</h2>
      <p>
        This policy describes cookies and similar technologies used by {LEGAL_SITE.platformName} based
        on the current application. We keep this aligned with actual behaviour — if we add new
        tracking tools, we will update this page and version number.
      </p>

      <h2>2. Authentication</h2>
      <p>
        When you sign in, session cookies (or equivalent secure session tokens) are set by our
        authentication system to keep you logged in. These are essential for the service.
      </p>

      <h2>3. Preferences and client storage</h2>
      <p>
        The site may store theme preference (light/dark) and similar UI settings in your browser. A
        session-scoped key may be stored in <code>sessionStorage</code> for anonymous analytics and ad
        impression deduplication on the landing page and feed where advertising is enabled.
      </p>

      <h2>4. Analytics and advertising</h2>
      <p>
        We record aggregated page-view events (page key, device type, anonymous viewer key) via our
        own API — not third-party advertising cookies unless explicitly added later. Sponsored content
        and internal ad placements may use server-side event logging. You can limit exposure by using
        the platform without enabling optional notifications.
      </p>

      <h2>5. Push notifications</h2>
      <p>
        If you opt in to push notifications, your browser stores subscription data and our servers
        store the push endpoint and keys needed to deliver notifications.
      </p>

      <h2>6. Managing cookies</h2>
      <p>
        You can clear cookies and site data in your browser settings. Clearing authentication cookies
        will sign you out. Blocking essential cookies may prevent the platform from working correctly.
      </p>

      <h2>7. Contact</h2>
      <p>Questions: {LEGAL_SITE.privacyContactEmail}.</p>
    </>
  );
}
