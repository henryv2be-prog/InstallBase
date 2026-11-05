import Link from "next/link";

const LINKS = [
  { href: "/about", label: "About KasiFind" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/contact", label: "Contact & Support" },
] as const;

/** Compact trust links for mobile menu and similar surfaces. */
export function KfTrustNavLinks({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <div className="kf-trust-nav-links">
      <p className="kf-trust-nav-kicker">Trust & support</p>
      <ul className="mt-2 space-y-1">
        {LINKS.map(({ href, label }) => (
          <li key={href}>
            <Link href={href} className="kf-trust-nav-link" onClick={onNavigate}>
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
