"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AdminStatCard } from "@/components/admin/admin-stat-card";
import {
  adminBackfillMemberTiers,
  adminDeletePost,
  adminDeleteUser,
  adminResolveReport,
  adminSuspendUser,
} from "@/lib/actions";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";
import { ReengagementDebugPanel } from "@/components/admin/reengagement-debug";
import { MemberTierBadge } from "@/components/ui/badge";
import { getMemberTierLabel } from "@/lib/membership";
import type { MemberTier } from "@/generated/prisma/client";

interface AdminDashboardProps {
  data: {
    stats: {
      users: number;
      activeUsers: number;
      posts: number;
      brags: number;
      questions: number;
      comments: number;
      reports: number;
      newUsersWeek: number;
      landingViewsToday: number;
      landingUniqueVisitorsToday: number;
      landingViewsWeek: number;
      landingUniqueVisitorsWeek: number;
      landingViewsAllTime: number;
      signupRateWeek: number | null;
    };
    pendingReports: Array<{
      id: string;
      reason: string;
      description: string | null;
      createdAt: Date;
      reporter: { profile: { username: string } | null };
      post: { id: string; content: string; author: { profile: { username: string } | null } } | null;
    }>;
    recentUsers: Array<{
      id: string;
      name: string | null;
      email: string;
      role: string;
      suspended: boolean;
      createdAt: Date;
      profile: { username: string; memberTier: MemberTier | null } | null;
    }>;
    recentPosts: Array<{
      id: string;
      content: string;
      type: string;
      createdAt: Date;
      author: { profile: { username: string } | null };
    }>;
  };
}

export function AdminDashboard({ data, currentUserId }: AdminDashboardProps & { currentUserId: string }) {
  const [pending, startTransition] = useTransition();
  const [confirmDeleteUserId, setConfirmDeleteUserId] = useState<string | null>(null);
  const router = useRouter();
  const { stats, pendingReports, recentUsers, recentPosts } = data;

  const headlineStats = [
    { label: "Total users", value: stats.users },
    { label: "Pending reports", value: stats.reports, highlight: stats.reports > 0 },
    { label: "Posts", value: stats.posts },
    { label: "New users (7d)", value: stats.newUsersWeek },
  ];

  const platformStats = [
    { label: "Active users", value: stats.activeUsers },
    { label: "Brags", value: stats.brags },
    { label: "Questions", value: stats.questions },
    { label: "Comments", value: stats.comments },
  ];

  const trafficStats = [
    { label: "Landing visits (7d)", value: stats.landingViewsWeek },
    { label: "Landing visitors (7d)", value: stats.landingUniqueVisitorsWeek },
    { label: "Landing visits today", value: stats.landingViewsToday },
    { label: "Landing visitors today", value: stats.landingUniqueVisitorsToday },
    { label: "Landing visits (all time)", value: stats.landingViewsAllTime },
    {
      label: "Signup rate (7d)",
      value: stats.signupRateWeek === null ? "—" : `${stats.signupRateWeek}%`,
    },
  ];

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="text-2xl font-bold sm:text-3xl">Admin dashboard</h1>
        <p className="mt-1 text-sm text-muted">Moderation, users, and platform health</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {headlineStats.map((stat) => (
          <AdminStatCard key={stat.label} {...stat} />
        ))}
      </div>

      <details className="group rounded-2xl border border-border bg-card/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>More platform stats</span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="grid grid-cols-2 gap-3 border-t border-border p-4 lg:grid-cols-4">
          {platformStats.map((stat) => (
            <AdminStatCard key={stat.label} {...stat} className="bg-background/50" />
          ))}
        </div>
      </details>

      <details className="group rounded-2xl border border-border bg-card/40">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 text-sm font-semibold [&::-webkit-details-marker]:hidden">
          <span>Landing page traffic</span>
          <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" />
        </summary>
        <div className="space-y-3 border-t border-border p-4">
          <p className="text-xs text-muted">
            Signup rate = new users ÷ unique landing visitors (7d).
          </p>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {trafficStats.map((stat) => (
              <AdminStatCard key={stat.label} {...stat} className="bg-background/50" />
            ))}
          </div>
        </div>
      </details>

      <section>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold sm:text-xl">Moderation queue</h2>
          {pendingReports.length > 0 && (
            <span className="rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              {pendingReports.length} pending
            </span>
          )}
        </div>
        {pendingReports.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-border bg-card/40 px-4 py-8 text-center text-sm text-muted">
            No pending reports
          </p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="rounded-2xl border border-border bg-card p-4"
              >
                <p className="font-semibold">{report.reason.replace(/_/g, " ")}</p>
                <p className="text-sm text-muted">
                  Reported by @{report.reporter.profile?.username}
                </p>
                {report.description && (
                  <p className="mt-2 text-sm">{report.description}</p>
                )}
                {report.post && (
                  <p className="mt-2 text-sm text-muted line-clamp-2">
                    Post by @{report.post.author.profile?.username}: {report.post.content}
                  </p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await adminResolveReport(report.id, "RESOLVED");
                        toast.success("Report resolved");
                        router.refresh();
                      })
                    }
                  >
                    Resolve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await adminResolveReport(report.id, "DISMISSED");
                        router.refresh();
                      })
                    }
                  >
                    Dismiss
                  </Button>
                  {report.post && (
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          await adminDeletePost(report.post!.id);
                          toast.success("Post deleted");
                          router.refresh();
                        })
                      }
                    >
                      Delete post
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ReengagementDebugPanel />

      <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold sm:text-xl">Recent users</h2>
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    const result = await adminBackfillMemberTiers();
                    toast.success(`Recalculated badges for ${result.profilesUpdated} profile(s)`);
                    router.refresh();
                  } catch {
                    toast.error("Could not recalculate member badges");
                  }
                })
              }
            >
              Recalculate badges
            </Button>
          </div>
          <div className="space-y-2">
            {recentUsers.map((user) => {
              const isSelf = user.id === currentUserId;
              const isAdmin = user.role === "ADMIN";
              const canDelete = !isSelf && !isAdmin;

              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-semibold">{user.name}</p>
                        {user.profile?.memberTier && (
                          <MemberTierBadge tier={user.profile.memberTier} compact />
                        )}
                        {isAdmin && (
                          <span className="rounded-full bg-slate-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="truncate text-sm text-muted">@{user.profile?.username}</p>
                      <p className="truncate text-xs text-muted">{user.email}</p>
                      {user.profile?.memberTier && (
                        <p className="text-xs text-muted">{getMemberTierLabel(user.profile.memberTier)}</p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={user.suspended ? "default" : "outline"}
                        className="shrink-0"
                        disabled={pending || isSelf}
                        onClick={() =>
                          startTransition(async () => {
                            await adminSuspendUser(user.id, !user.suspended);
                            router.refresh();
                          })
                        }
                      >
                        {user.suspended ? "Unsuspend" : "Suspend"}
                      </Button>
                      {canDelete && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="shrink-0"
                          disabled={pending}
                          onClick={() => setConfirmDeleteUserId(user.id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>

                  {confirmDeleteUserId === user.id && (
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3 dark:border-red-900/50 dark:bg-red-950/30">
                      <p className="text-sm font-semibold text-red-950 dark:text-red-100">
                        Delete @{user.profile?.username}?
                      </p>
                      <p className="mt-1 text-sm text-red-900/90 dark:text-red-100/80">
                        This permanently removes the account, profile, posts, and messages. Founding Member and Early
                        Builder badges are recalculated for remaining users automatically.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={pending}
                          onClick={() => setConfirmDeleteUserId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={pending}
                          onClick={() =>
                            startTransition(async () => {
                              const result = await adminDeleteUser(user.id);
                              if ("error" in result) {
                                toast.error(result.error);
                                return;
                              }
                              setConfirmDeleteUserId(null);
                              toast.success("User deleted and member badges recalculated");
                              router.refresh();
                            })
                          }
                        >
                          {pending ? "Deleting…" : "Delete permanently"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-lg font-bold sm:text-xl">Recent posts</h2>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase text-muted">{post.type}</p>
                  <p className="line-clamp-2 text-sm">{post.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="w-full shrink-0 sm:w-auto"
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await adminDeletePost(post.id);
                      router.refresh();
                    })
                  }
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
