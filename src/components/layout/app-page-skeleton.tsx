import { PostSkeleton } from "@/components/ui/skeleton";

export function AppPageSkeleton() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="h-8 w-40 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      <div className="h-4 w-64 animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800" />
      <PostSkeleton />
      <PostSkeleton />
    </div>
  );
}
