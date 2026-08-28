"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { adminSuspendUser, adminDeletePost, adminResolveReport } from "@/lib/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
      suspended: boolean;
      createdAt: Date;
      profile: { username: string } | null;
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

export function AdminDashboard({ data }: AdminDashboardProps) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const { stats, pendingReports, recentUsers, recentPosts } = data;

  const statCards = [
    { label: "Total Users", value: stats.users },
    { label: "Active Users", value: stats.activeUsers },
    { label: "Posts", value: stats.posts },
    { label: "Brags", value: stats.brags },
    { label: "Questions", value: stats.questions },
    { label: "Comments", value: stats.comments },
    { label: "Pending Reports", value: stats.reports },
    { label: "New Users (7d)", value: stats.newUsersWeek },
  ];

  return (
    <div className="animate-fade-in">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="mt-1 text-3xl font-bold">{stat.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <section className="mb-8">
        <h2 className="mb-4 text-xl font-bold">Moderation Queue</h2>
        {pendingReports.length === 0 ? (
          <p className="text-gray-500">No pending reports</p>
        ) : (
          <div className="space-y-3">
            {pendingReports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900"
              >
                <p className="font-semibold">{report.reason.replace(/_/g, " ")}</p>
                <p className="text-sm text-gray-500">
                  Reported by @{report.reporter.profile?.username}
                </p>
                {report.description && (
                  <p className="mt-1 text-sm">{report.description}</p>
                )}
                {report.post && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                    Post by @{report.post.author.profile?.username}: {report.post.content}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
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
                      Delete Post
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-bold">Recent Users</h2>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-500">@{user.profile?.username}</p>
                </div>
                <Button
                  size="sm"
                  variant={user.suspended ? "default" : "destructive"}
                  disabled={pending}
                  onClick={() =>
                    startTransition(async () => {
                      await adminSuspendUser(user.id, !user.suspended);
                      router.refresh();
                    })
                  }
                >
                  {user.suspended ? "Unsuspend" : "Suspend"}
                </Button>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-bold">Recent Posts</h2>
          <div className="space-y-2">
            {recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-800 dark:bg-gray-900"
              >
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-semibold uppercase text-gray-400">{post.type}</p>
                  <p className="truncate text-sm">{post.content}</p>
                </div>
                <Button
                  size="sm"
                  variant="destructive"
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
