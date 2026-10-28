"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MapPinned, Menu, PlusCircle, X } from "lucide-react";

function BrandMark() {
  return (
    <span className="kf-brand-mark" aria-hidden>
      <MapPinned className="h-5 w-5" strokeWidth={2.25} />
    </span>
  );
}

export function KfHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/kasifind";

  return (
    <header className="kf-header">
      <div className="mx-auto max-w-5xl kf-header-inner">
        <Link href="/kasifind" className="kf-brand" onClick={() => setOpen(false)}>
          <BrandMark />
          <div className="min-w-0">
            <div className="kf-wordmark">KasiFind</div>
            {!isHome && <p className="kf-tagline truncate">Find local. Support local.</p>}
          </div>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex" aria-label="Main">
          <Link href="/kasifind/account/listing" className="kf-btn kf-btn-primary text-sm">
            <PlusCircle className="h-4 w-4" aria-hidden />
            List your business
          </Link>
        </nav>

        <button
          type="button"
          className="kf-btn kf-btn-ghost sm:hidden"
          aria-expanded={open}
          aria-controls="kf-mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {open && (
        <nav
          id="kf-mobile-nav"
          className="border-t border-[var(--kf-border)] bg-white px-4 py-3 sm:hidden kf-animate-in"
          aria-label="Mobile"
        >
          <Link
            href="/kasifind/account/listing"
            className="kf-btn kf-btn-primary w-full"
            onClick={() => setOpen(false)}
          >
            <PlusCircle className="h-4 w-4" aria-hidden />
            List your business
          </Link>
          <Link
            href="/kasifind/account/login"
            className="kf-btn kf-btn-outline mt-2 w-full"
            onClick={() => setOpen(false)}
          >
            Provider sign in
          </Link>
        </nav>
      )}
    </header>
  );
}
