export function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-xl bg-gray-200 dark:bg-gray-800 ${className ?? ""}`} />
  );
}

export function PostSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <Skeleton className="mt-4 h-20 w-full" />
      <Skeleton className="mt-4 h-48 w-full" />
    </div>
  );
}
