import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, MapPin, MessageCircle, PlusCircle, Smartphone, Users } from "lucide-react";
import { KfListYourBusinessExamples } from "@/components/kasifind/kf-list-your-business-examples";
import type { KfSearchResult } from "@/components/kasifind/types";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { searchProvidersBrowse } from "@/lib/kasifind/search";
import { getKasiFindSessionUser } from "@/lib/kasifind/session";
import { listYourBusinessCtaHref } from "@/lib/kasifind/provider-nav";

const PAGE_TITLE = "List Your Business Free on KasiFind";
const PAGE_DESCRIPTION =
  "Create a free KasiFind listing so neighbours can discover your local business on mobile search — no monthly fees, commissions or hidden charges.";

const EXAMPLE_LISTING_LIMIT = 8;

export const metadata: Metadata = {
  title: PAGE_TITLE,
  description: PAGE_DESCRIPTION,
  alternates: { canonical: "/list-your-business" },
  openGraph: {
    title: PAGE_TITLE,
    description: PAGE_DESCRIPTION,
    url: "/list-your-business",
    type: "website",
    locale: "en_ZA",
  },
};

export const dynamic = "force-dynamic";

export default async function ListYourBusinessPage() {
  const dbConfigured = isKasiFindDbConfigured();
  let examples: KfSearchResult[] = [];
  if (dbConfigured) {
    try {
      const { results } = await searchProvidersBrowse({ query: "", limit: EXAMPLE_LISTING_LIMIT });
      examples = results;
    } catch {
      examples = [];
    }
  }

  const user = dbConfigured ? await getKasiFindSessionUser().catch(() => null) : null;
  const registerHref = listYourBusinessCtaHref(Boolean(user));

  return (
    <div className="space-y-8 pb-6">
      <section className="kf-hero kf-hero--landing kf-animate-in">
        <div className="kf-hero-bg" aria-hidden />
        <p className="kf-hero-kicker">For local businesses &amp; artisans</p>
        <h1 className="kf-hero-title">Get discovered by customers near you — 100% free</h1>
        <p className="mt-3 max-w-2xl text-sm text-[var(--kf-muted)] sm:text-base">
          KasiFind helps South Africans find plumbers, gate fitters, mechanics, hairdressers and hundreds of
          other local services. Your listing puts your business in front of people already searching in your
          area.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link href={registerHref} className="kf-btn kf-btn-primary text-base">
            <PlusCircle className="h-5 w-5" aria-hidden />
            Register Your Business — It&apos;s Free
          </Link>
          <Link href="/" className="kf-btn kf-btn-outline text-base">
            See how customers browse
          </Link>
        </div>
      </section>

      <section className="kf-card kf-animate-in p-5 sm:p-6" aria-labelledby="kf-lyb-free-heading">
        <h2 id="kf-lyb-free-heading" className="kf-section-title">
          Free listing — always
        </h2>
        <p className="kf-section-sub mt-1">
          No monthly fees, no commissions and no hidden charges.
        </p>
        <ul className="mt-4 space-y-2 text-sm text-[var(--kf-charcoal)]">
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
            <span>List your business on KasiFind at no cost.</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
            <span>Customers contact you directly on WhatsApp or phone — you keep every job.</span>
          </li>
          <li className="flex gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
            <span>Show photos, services and your area so the right neighbours find you.</span>
          </li>
        </ul>
      </section>

      <section className="kf-animate-in" aria-labelledby="kf-lyb-reach-heading">
        <h2 id="kf-lyb-reach-heading" className="kf-section-title">
          How you reach local customers
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <article className="kf-card p-4">
            <Users className="h-5 w-5 text-[var(--kf-forest)]" aria-hidden />
            <h3 className="mt-2 font-semibold text-[var(--kf-charcoal)]">Nationwide discovery</h3>
            <p className="mt-1 text-sm text-[var(--kf-muted)]">
              Your listing can appear when people browse KasiFind or search for your trade across South
              Africa.
            </p>
          </article>
          <article className="kf-card p-4">
            <MapPin className="h-5 w-5 text-[var(--kf-forest)]" aria-hidden />
            <h3 className="mt-2 font-semibold text-[var(--kf-charcoal)]">Near-me search</h3>
            <p className="mt-1 text-sm text-[var(--kf-muted)]">
              Customers who share their area see providers sorted by distance — ideal for mobile, on-the-go
              searches.
            </p>
          </article>
          <article className="kf-card p-4">
            <Smartphone className="h-5 w-5 text-[var(--kf-forest)]" aria-hidden />
            <h3 className="mt-2 font-semibold text-[var(--kf-charcoal)]">WhatsApp-ready profile</h3>
            <p className="mt-1 text-sm text-[var(--kf-muted)]">
              A public profile with tap-to-chat and call buttons so enquiries stay on channels you already
              use.
            </p>
          </article>
        </div>
      </section>

      <section className="kf-animate-in" aria-labelledby="kf-lyb-examples-heading">
        <h2 id="kf-lyb-examples-heading" className="kf-section-title">
          Live listings on KasiFind
        </h2>
        <p className="kf-section-sub mt-0.5">
          These are real published businesses — your listing can look just as professional.
        </p>
        {dbConfigured ? (
          <KfListYourBusinessExamples examples={examples} />
        ) : (
          <p className="kf-section-sub mt-3">Examples load when the KasiFind database is connected.</p>
        )}
      </section>

      <section className="kf-card kf-animate-in p-5 sm:p-6" aria-labelledby="kf-lyb-steps-heading">
        <h2 id="kf-lyb-steps-heading" className="kf-section-title">
          Simple registration
        </h2>
        <ol className="mt-4 space-y-3 text-sm text-[var(--kf-charcoal)]">
          <li className="flex gap-3">
            <span className="kf-chip kf-chip-active shrink-0">1</span>
            <span>Start your listing — business name, location, services and photos.</span>
          </li>
          <li className="flex gap-3">
            <span className="kf-chip kf-chip-active shrink-0">2</span>
            <span>Create a free account when you save or publish (no company registration required).</span>
          </li>
          <li className="flex gap-3">
            <span className="kf-chip kf-chip-active shrink-0">3</span>
            <span>Publish for review — once approved, your listing goes live on KasiFind.</span>
          </li>
        </ol>
        <p className="mt-4 flex items-start gap-2 text-sm text-[var(--kf-muted)]">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />
          Need help? Visit{" "}
          <Link href="/contact" className="kf-link underline">
            Contact &amp; support
          </Link>{" "}
          — we reply by email or WhatsApp.
        </p>
        <div className="mt-5">
          <Link href={registerHref} className="kf-btn kf-btn-primary w-full text-base sm:w-auto">
            <PlusCircle className="h-5 w-5" aria-hidden />
            Register Your Business — It&apos;s Free
          </Link>
        </div>
      </section>
    </div>
  );
}