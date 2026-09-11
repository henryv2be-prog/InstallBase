import Link from "next/link";
import Image from "next/image";
import { Briefcase } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { Badge } from "@/components/ui/badge";
import { RelativeTime } from "@/components/ui/relative-time";
import type { WorkPortfolioGroup } from "@/lib/queries";

interface WorkPortfolioProps {
  groups: WorkPortfolioGroup[];
  totalCount: number;
  ownerName: string;
  isOwnProfile: boolean;
}

export function WorkPortfolio({
  groups,
  totalCount,
  ownerName,
  isOwnProfile,
}: WorkPortfolioProps) {
  if (totalCount === 0) {
    return (
      <EmptyState
        icon={Briefcase}
        title="No work portfolio yet"
        description={
          isOwnProfile
            ? "Post installation or service work with photos — tagged posts will appear here as evidence of what you do."
            : `${ownerName} hasn't tagged any work posts yet.`
        }
        action={isOwnProfile ? { label: "Share your work", href: "/create" } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Work posted by {isOwnProfile ? "you" : ownerName}. Each item links to the original post.
      </p>

      {groups.map((group) => (
        <section key={group.trade} className="glass-card rounded-2xl p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-bold">{group.trade}</h3>
              <p className="text-sm text-muted">
                {group.count} project{group.count === 1 ? "" : "s"}
              </p>
            </div>
            <Badge variant="secondary">{group.count}</Badge>
          </div>

          <div className="space-y-3">
            {group.posts.map((post) => {
              const preview = post.media[0];
              const title = post.title || post.content.slice(0, 80) || "Work post";
              return (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="flex gap-3 rounded-xl border border-border bg-card/50 p-3 transition-colors hover:border-blue-500/40 hover:bg-card"
                >
                  {preview ? (
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                      {preview.type === "video" ? (
                        <video src={preview.url} className="h-full w-full object-cover" muted playsInline />
                      ) : (
                        <Image src={preview.url} alt="" fill className="object-cover" sizes="64px" />
                      )}
                    </div>
                  ) : (
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs text-muted dark:bg-gray-800">
                      Post
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium line-clamp-2">{title}</p>
                    <p className="mt-1 text-xs text-muted">
                      Posted <RelativeTime date={post.createdAt} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
