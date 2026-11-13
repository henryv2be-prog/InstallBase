import Link from "next/link";

const FOOTER_LINKS = [
  { href: "/about", label: "About" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
  { href: "/contact", label: "Contact" },
] as const;

const SOCIAL_LINKS = [
  { href: "https://www.tiktok.com/@kasifindsa", label: "TikTok" },
  { href: "https://www.instagram.com/kasifindsa", label: "Instagram" },
  { href: "https://www.facebook.com/kasifind", label: "Facebook" },
] as const;

const SOCIAL_HANDLE = "@kasifindsa";

export function KfSiteFooter() {
  return (
    <footer className="kf-footer">
      <p className="font-semibold text-[var(--kf-forest)]">
        KasiFind | Local businesses. Local communities.
      </p>
      <nav className="kf-footer-nav mt-3" aria-label="Legal and support">
        {FOOTER_LINKS.map(({ href, label }, i) => (
          <span key={href} className="inline-flex items-center gap-3">
            {i > 0 ? <span className="text-[var(--kf-border)]" aria-hidden>|</span> : null}
            <Link href={href} className="kf-footer-link">
              {label}
            </Link>
          </span>
        ))}
      </nav>
      <nav className="kf-footer-social mt-4" aria-label="KasiFind on social media">
        <p className="kf-footer-social-kicker">Follow us {SOCIAL_HANDLE}</p>
        <ul className="kf-footer-social-list">
          {SOCIAL_LINKS.map(({ href, label }) => (
            <li key={href}>
              <a
                href={href}
                className="kf-footer-social-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="sr-only">{label} — </span>
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <p className="mt-4 text-[0.7rem] text-[var(--kf-muted)]">
        © 2026 KasiFind. All rights reserved.
      </p>
    </footer>
  );
}
