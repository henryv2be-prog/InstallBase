import { Suspense } from "react";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";
import { getSuggestedSearchTerms } from "@/lib/queries";

export const metadata = { title: "Search" };
export const dynamic = "force-dynamic";

interface SearchPageProps {
  searchParams: Promise<{ q?: string; type?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q, type = "all" } = await searchParams;
  const suggestions = await getSuggestedSearchTerms();

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <SearchForm initialQuery={q} initialFilter={type} suggestions={suggestions} />
      {q && (
        <Suspense fallback={<p className="mt-6 text-gray-500">Searching...</p>}>
          <SearchResults query={q} filter={type} />
        </Suspense>
      )}
    </div>
  );
}
