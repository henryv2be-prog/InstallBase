"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export function SearchForm({ initialQuery }: { initialQuery?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery ?? "");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
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
    </form>
  );
}
