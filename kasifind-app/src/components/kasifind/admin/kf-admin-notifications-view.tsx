"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminNotificationListItem } from "@/lib/kasifind/admin-notifications";
import {
  kfAdminMarkAllNotificationsRead,
  kfAdminMarkNotificationRead,
} from "@/lib/kasifind/admin-notification-actions";

type Props = {
  items: AdminNotificationListItem[];
  filter: { unreadOnly: boolean; category: string; priority: string };
};

export function KfAdminNotificationsView({ items, filter }: Props) {
  const router = useRouter();

  async function markRead(id: string) {
    await kfAdminMarkNotificationRead(id);
    router.refresh();
  }

  async function markAll() {
    await kfAdminMarkAllNotificationsRead();
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <section className="kf-card p-4">
        <h2 className="text-sm font-semibold text-[var(--kf-ink)]">Filters</h2>
        <form className="mt-3 flex flex-wrap gap-2 text-sm" method="get">
          <label className="flex items-center gap-2">
            <input type="checkbox" name="unread" value="1" defaultChecked={filter.unreadOnly} />
            Unread only
          </label>
          <select name="category" defaultValue={filter.category} className="kf-input text-sm">
            <option value="">All categories</option>
            <option value="listing">Listing</option>
            <option value="provider">Provider</option>
            <option value="customer">Customer</option>
            <option value="admin">Admin</option>
            <option value="technical">Technical</option>
            <option value="user">User</option>
          </select>
          <select name="priority" defaultValue={filter.priority} className="kf-input text-sm">
            <option value="">All priorities</option>
            <option value="INFO">Info</option>
            <option value="IMPORTANT">Important</option>
            <option value="CRITICAL">Critical</option>
          </select>
          <button type="submit" className="kf-btn kf-btn-outline text-sm">
            Apply
          </button>
        </form>
        <div className="mt-3">
          <button type="button" className="kf-btn kf-btn-ghost text-sm" onClick={() => void markAll()}>
            Mark all as read
          </button>
        </div>
      </section>

      <div className="kf-card p-0">
        <ul className="divide-y divide-[var(--kf-line)]">
          {items.length === 0 ? (
            <li className="p-6 text-center text-sm text-[var(--kf-muted)]">No notifications yet.</li>
          ) : (
            items.map((n) => (
              <li
                key={n.id}
                className={`p-4 ${n.readAt ? "opacity-80" : "bg-[var(--kf-surface-alt)]"}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-[var(--kf-ink)]">{n.title}</p>
                    <p className="mt-1 text-sm text-[var(--kf-muted)]">{n.body}</p>
                    <p className="mt-2 text-xs text-[var(--kf-muted)]">
                      {n.category} · {n.priority} · {new Date(n.createdAt).toLocaleString("en-ZA")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link href={n.deepLink} className="kf-btn kf-btn-outline text-xs" onClick={() => void markRead(n.id)}>
                      Open
                    </Link>
                    {!n.readAt ? (
                      <button
                        type="button"
                        className="kf-btn kf-btn-ghost text-xs"
                        onClick={() => void markRead(n.id)}
                      >
                        Mark read
                      </button>
                    ) : null}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}