import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { categoryPublicPath } from "@/lib/kasifind/category-public-path";
import { listKfCategories } from "@/lib/kasifind/categories";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicOpenGraph,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";

export const dynamic = "force-dynamic";

const CATEGORIES_TITLE = "Browse categories";
const CATEGORIES_DESCRIPTION =
  "Explore local business categories on KasiFind — plumbing, electrical, automotive, and more across South Africa.";

export async function generateMetadata(): Promise<Metadata> {
  const headerStore = await headers();
  const canonical = buildCanonicalUrl("/categories", headerStore);
  const ogTitle = `${CATEGORIES_TITLE} | KasiFind`;
  return {
    title: CATEGORIES_TITLE,
    description: CATEGORIES_DESCRIPTION,
    alternates: buildCanonicalAlternates("/categories", headerStore),
    openGraph: buildPublicOpenGraph({
      title: ogTitle,
      description: CATEGORIES_DESCRIPTION,
      canonical,
    }),
    twitter: buildPublicTwitter(ogTitle, CATEGORIES_DESCRIPTION),
  };
}

export default async function CategoriesIndexPage() {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card p-6">
        <p>KasiFind is not configured on this server.</p>
      </div>
    );
  }

  const categories = await listKfCategories();

  return (
    <div className="kf-animate-in">
      <h1 className="kf-hero-title text-2xl sm:text-3xl">Browse categories</h1>
      <p className="kf-section-sub mt-2">
        Find published local businesses by trade or service. Each category links to listed providers you
        can contact directly.
      </p>
      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {categories.map((parent) => {
          const Icon = categoryIconForSlug(parent.slug);
          return (
            <li key={parent.id} className="kf-card p-4">
              <div className="flex items-start gap-3">
                <span className="kf-category-icon shrink-0" aria-hidden>
                  <Icon className="h-5 w-5" />
                </span>
                <h2 className="min-w-0 text-base font-semibold">
                  <Link
                    href={categoryPublicPath(parent.slug)}
                    className="text-[var(--kf-charcoal)] hover:text-[var(--kf-forest)]"
                  >
                    {parent.name}
                  </Link>
                </h2>
              </div>
              {parent.children.length > 0 ? (
                <ul className="mt-3 flex flex-wrap gap-2 pl-9">
                  {parent.children.map((c) => (
                    <li key={c.id}>
                      <Link href={categoryPublicPath(c.slug)} className="kf-link text-sm underline">
                        {c.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>
      <p className="mt-8 text-sm text-[var(--kf-muted)]">
        Prefer distance-based search?{" "}
        <Link href="/" className="kf-link underline">
          Return to home
        </Link>{" "}
        to use Near me or choose an area.
      </p>
    </div>
  );
}