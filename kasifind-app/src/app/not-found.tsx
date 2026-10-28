import Link from "next/link";

export default function NotFound() {
  return (
    <div className="kf-card mx-auto max-w-md px-6 py-12 text-center kf-animate-in">
      <p className="text-sm font-semibold uppercase tracking-widest text-[var(--kf-green)]">404</p>
      <h1 className="kf-hero-title mt-2 text-2xl">Page not found</h1>
      <p className="kf-section-sub mt-2">
        This page is not on KasiFind. Try searching for a local service instead.
      </p>
      <Link href="/" className="kf-btn kf-btn-primary mt-6 inline-flex">
        Back to home
      </Link>
    </div>
  );
}
