import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About KasiFind" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact & Support" },
] as const;

/** Compact trust links for mobile menu and similar surfaces. */
export function KfTrustNavLinks({
  onNavigate,
  collapsed = false,
}: {
  onNavigate?: () => void;
  /** Collapse under a disclosure in the hamburger menu. */
  collapsed?: boolean;
}) {
  const list = (
    <ul className="mt-2 space-y-1">
      {LINKS.map(({ href, label }) => (
        <li key={href}>
          <Link href={href} className="kf-trust-nav-link" onClick={onNavigate}>
            {label}
          </Link>
        </li>
      ))}
    </ul>
  );

  if (!collapsed) {
    return (
      <div className="kf-trust-nav-links">
        <p className="kf-trust-nav-kicker">Trust & support</p>
        {list}
      </div>
    );
  }

  return (
    <details className="kf-mobile-nav-details kf-trust-nav-links">
      <summary className="kf-mobile-nav-summary">Trust &amp; support</summary>
      {list}
    </details>
  );
}
