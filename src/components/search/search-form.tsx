"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "installers", label: "Installers" },
  { id: "posts", label: "Posts" },
  { id: "products", label: "Products" },
  { id: "projects", label: "Projects" },
] as const;

export function SearchForm({
  initialQuery,
  initialFilter = "all",
  suggestions = [],
}: {
  initialQuery?: string;
  initialFilter?: string;
  suggestions?: string[];
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");
  const [filter, setFilter] = useState(initialFilter);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (filter !== "all") params.set("type", filter);
    router.push(`/search?${params.toString()}`);
  };

  const applySuggestion = (term: string) => {
    setQuery(term);
    router.push(`/search?q=${encodeURIComponent(term)}${filter !== "all" ? `&type=${filter}` : ""}`);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === item.id
                  ? "bg-blue-600 text-white"
                  : "bg-card text-muted hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search installers, posts, products, Hikvision, PoE..."
              className="pl-10"
            />
          </div>
          <Button type="submit">Search</Button>
        </div>
      </form>
      {suggestions.length > 0 && !initialQuery && (
        <div className="flex flex-wrap gap-2">
          {suggestions.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => applySuggestion(term)}
              className="rounded-full border border-border bg-card/60 px-3 py-1 text-sm text-muted hover:text-foreground"
            >
              {term}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
