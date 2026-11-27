import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { categoryIconForSlug } from "@/components/kasifind/category-icons";
import { KfCategoryBrowseList } from "@/components/kasifind/kf-category-browse-list";
import { getKfCategoryBySlug } from "@/lib/kasifind/categories";
import { categoryBrowseDescription, categoryPublicPath } from "@/lib/kasifind/category-public-path";
import { isKasiFindDbConfigured } from "@/lib/kasifind/prisma";
import { searchProvidersBrowse } from "@/lib/kasifind/search";
import {
  buildCanonicalAlternates,
  buildCanonicalUrl,
  buildPublicOpenGraph,
  buildPublicTwitter,
} from "@/lib/kasifind/seo-canonical";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isKasiFindDbConfigured()) {
    return { title: "Category" };
  }
  const { slug } = await params;
  const category = await getKfCategoryBySlug(slug);
  if (!category) {
    return { title: "Category not found" };
  }
  const headerStore = await headers();
  const path = categoryPublicPath(slug);
  const canonical = buildCanonicalUrl(path, headerStore);
  const title = `${category.name} | KasiFind`;
  const description = categoryBrowseDescription(category.name);
  return {
    title: category.name,
    description,
    alternates: buildCanonicalAlternates(path, headerStore),
    openGraph: buildPublicOpenGraph({ title, description, canonical }),
    twitter: buildPublicTwitter(title, description),
  };
}

export default async function CategoryBrowsePage({ params }: Props) {
  if (!isKasiFindDbConfigured()) {
    return (
      <div className="kf-card p-6">
        <p>KasiFind is not configured on this server.</p>
      </div>
    );
  }

  const { slug } = await params;
  const category = await getKfCategoryBySlug(slug);
  if (!category) notFound();

  const { results } = await searchProvidersBrowse({
    query: "",
    categorySlug: slug,
  });

  const Icon = categoryIconForSlug(category.slug);

  return (
    <div className="kf-animate-in">
      <nav className="text-sm">
        <Link href="/categories" className="kf-link underline">
          Categories
        </Link>
        {category.parent ? (
          <>
            <span className="mx-1 text-[var(--kf-muted)]" aria-hidden>
              /
            </span>
            <Link href={categoryPublicPath(category.parent.slug)} className="kf-link underline">
              {category.parent.name}
            </Link>
          </>
        ) : null}
      </nav>

      <header className="mt-3 flex items-start gap-3">
        <span className="kf-category-icon shrink-0" aria-hidden>
          <Icon className="h-6 w-6" />
        </span>
        <div>
          <h1 className="kf-hero-title text-2xl sm:text-3xl">{category.name}</h1>
          <p className="kf-section-sub mt-1">{categoryBrowseDescription(category.name)}</p>
        </div>
      </header>

      {category.children.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {category.children.map((child) => (
            <Link key={child.id} href={categoryPublicPath(child.slug)} className="kf-chip kf-chip-active">
              {child.name}
            </Link>
          ))}
        </div>
      ) : null}

      <p className="mt-4 text-sm text-[var(--kf-muted)]">
        {results.length > 0
          ? `Showing ${results.length} published listing${results.length === 1 ? "" : "s"} in this category (featured first, then relevance).`
          : "No published listings in this category yet."}
      </p>

      <KfCategoryBrowseList listings={results} categoryName={category.name} />

      <p className="mt-8 text-sm text-[var(--kf-muted)]">
        Need a specific area?{" "}
        <Link href="/" className="kf-link underline">
          Search from home
        </Link>{" "}
        with Near me or a chosen location — this page does not change your live search filters.
      </p>
    </div>
  );
}