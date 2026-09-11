import Link from "next/link";
import Image from "next/image";
import { Camera } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { RelativeTime } from "@/components/ui/relative-time";
import { formatWorkPostCount } from "@/lib/work-posts";
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
        icon={Camera}
        title="No work shared yet"
        description={
          isOwnProfile
            ? "When you post installation or service work, it can appear here as evidence of what you do — linked to your original posts."
            : `${ownerName} hasn't shared tagged work posts yet.`
        }
        action={isOwnProfile ? { label: "Share something", href: "/create" } : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        {formatWorkPostCount(totalCount)} showing work {isOwnProfile ? "you've" : `${ownerName} has`} posted on
        InstallBase. Each item links to the original post — not a separate CV entry.
      </p>

      {groups.map((group) => (
        <section key={group.trade} className="glass-card rounded-2xl p-5">
          <div className="mb-4">
            <h3 className="text-lg font-bold">{group.trade}</h3>
            <p className="text-sm text-muted">{formatWorkPostCount(group.count)}</p>
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
                      Posted by {isOwnProfile ? "you" : ownerName} · <RelativeTime date={post.createdAt} />
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
