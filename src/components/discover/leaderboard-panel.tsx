import Link from "next/link";
import { PostFeed } from "@/components/feed/post-card";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { formatNumber } from "@/lib/utils";
import type { PostCardData } from "@/lib/queries";

type InstallerEntry = {
  id: string;
  username: string;
  bragCount: number;
  totalBragPoints: number;
  user: {
    name: string | null;
    image: string | null;
    lastSeenAt: Date | null;
  };
};

type BragOfWeekEntry = {
  category: string;
  post: PostCardData | undefined;
};

interface LeaderboardPanelProps {
  installers: InstallerEntry[];
  bragOfWeek: BragOfWeekEntry[];
  allTime: PostCardData[];
  hotBrags: PostCardData[];
  currentUserId?: string;
  preview?: boolean;
}

function rankMedal(rank: number) {
  if (rank === 0) return "🥇";
  if (rank === 1) return "🥈";
  if (rank === 2) return "🥉";
  return `#${rank + 1}`;
}

export function InstallerLeaderboardList({
  installers,
  limit,
}: {
  installers: InstallerEntry[];
  limit?: number;
}) {
  const rows = limit ? installers.slice(0, limit) : installers;

  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-8 text-center">
        <p className="font-semibold">No brag points yet</p>
        <p className="mt-1 text-sm text-muted">Give brag points on installation posts to populate the board.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card">
      {rows.map((installer, i) => (
        <Link
          key={installer.id}
          href={`/profile/${installer.username}`}
          className="flex items-center gap-4 border-b border-border p-4 last:border-0 transition-colors hover:bg-foreground/5"
        >
          <span className="w-8 text-center text-sm font-bold text-muted">{rankMedal(i)}</span>
          <PresenceAvatar
            src={installer.user.image}
            name={installer.user.name}
            lastSeenAt={installer.user.lastSeenAt}
            className="h-10 w-10"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-semibold">{installer.user.name}</p>
            <p className="text-sm text-muted">
              {installer.bragCount} install{installer.bragCount === 1 ? "" : "s"} shared
            </p>
          </div>
          <span className="shrink-0 text-sm font-semibold text-foreground">
            🏆 {formatNumber(installer.totalBragPoints)}
          </span>
        </Link>
      ))}
    </div>
  );
}

export function LeaderboardPanel({
  installers,
  bragOfWeek,
  allTime,
  hotBrags,
  currentUserId,
  preview = false,
}: LeaderboardPanelProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-bold">🏆 Brag Leaderboard</h2>
        <p className="mt-1 text-sm text-muted">
          Brag points never expire on profiles. Spotlight rankings favor recent installs with community brags.
        </p>
      </div>

      <section>
        <h3 className="mb-3 text-lg font-bold">Top installers</h3>
        <InstallerLeaderboardList installers={installers} limit={preview ? 5 : undefined} />
      </section>

      {!preview && bragOfWeek.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-bold">This week&apos;s spotlight</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {bragOfWeek.slice(0, 8).map(({ category, post }, i) =>
              post ? (
                <Link
                  key={post.id}
                  href={`/post/${post.id}`}
                  className="overflow-hidden rounded-2xl border border-border bg-card transition-colors hover:border-primary/40"
                >
                  <div
                    className={
                      i < 3
                        ? "border-b border-border bg-foreground/5 px-4 py-2 text-sm font-semibold"
                        : "border-b border-border px-4 py-2 text-sm font-medium text-muted"
                    }
                  >
                    {rankMedal(i)} {category}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold">{post.author.name}</p>
                    <p className="mt-1 line-clamp-2 text-sm">{post.title ?? post.content.slice(0, 80)}</p>
                    <p className="mt-2 text-sm font-medium text-muted">🏆 {post.bragScore} points</p>
                  </div>
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}

      {!preview && allTime.length > 0 && (
        <section>
          <h3 className="mb-3 text-lg font-bold">All-time</h3>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {allTime.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="rounded-2xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <p className="text-sm font-semibold">{post.author.name}</p>
                <p className="mt-1 line-clamp-2 text-sm">{post.title ?? post.content.slice(0, 80)}</p>
                <p className="mt-2 text-sm font-medium text-muted">🏆 {post.bragScore} points</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {!preview && (
        <section>
          <h3 className="mb-3 text-lg font-bold">Hot right now</h3>
          <div className="mx-auto max-w-2xl">
            <PostFeed posts={hotBrags} currentUserId={currentUserId} bragPresentation="compact" />
          </div>
        </section>
      )}
    </div>
  );
}
