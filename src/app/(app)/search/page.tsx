import { Suspense } from "react";
import { SearchForm } from "@/components/search/search-form";
import { SearchResults } from "@/components/search/search-results";

export const metadata = { title: "Search" };

interface SearchPageProps {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;

  return (
    <div className="mx-auto max-w-3xl animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Search</h1>
      <SearchForm initialQuery={q} />
      {q && (
        <Suspense fallback={<p className="mt-6 text-gray-500">Searching...</p>}>
          <SearchResults query={q} />
        </Suspense>
      )}
    </div>
  );
}
