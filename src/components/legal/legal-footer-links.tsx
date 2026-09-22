import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
  { href: "/community-guidelines", label: "Guidelines" },
  { href: "/content-policy", label: "Content & copyright" },
  { href: "/cookies", label: "Cookies" },
] as const;

export function LegalFooterLinks({ className }: { className?: string }) {
  return (
    <nav
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted", className)}
      aria-label="Legal policies"
    >
      {links.map(({ href, label }) => (
        <Link key={href} href={href} className="hover:text-foreground hover:underline">
          {label}
        </Link>
      ))}
    </nav>
  );
}
