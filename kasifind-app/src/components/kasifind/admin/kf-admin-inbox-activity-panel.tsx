"use client";

import { useState } from "react";
import Link from "next/link";
import { formatKfDateTime } from "@/lib/kasifind/format-datetime";
import type { AdminAuditFeedRow } from "@/lib/kasifind/admin-audit-feed";

type PlatformRow = {
  id: string;
  eventType: string;
  listingName: string | null;
  userEmail: string | null;
  visitorId: string;
  createdAt: string;
};

export function KfAdminInboxActivityPanel({
  adminFeed,
  platformFeed,
}: {
  adminFeed: AdminAuditFeedRow[];
  platformFeed: PlatformRow[];
}) {
  const [tab, setTab] = useState<"admin" | "platform">("admin");

  return (
    <section className="kf-admin-inbox-panel" aria-labelledby="kf-inbox-activity-heading">
      <div className="kf-admin-inbox-panel__head">
        <h3 id="kf-inbox-activity-heading" className="kf-admin-inbox-panel__title">
          Activity
        </h3>
        <div className="kf-admin-inbox-tabs" role="tablist" aria-label="Activity type">
          <button
            type="button"
            role="tab"
            aria-selected={tab === "admin"}
            className={`kf-admin-inbox-tab${tab === "admin" ? " kf-admin-inbox-tab--active" : ""}`}
            onClick={() => setTab("admin")}
          >
            Admin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={tab === "platform"}
            className={`kf-admin-inbox-tab${tab === "platform" ? " kf-admin-inbox-tab--active" : ""}`}
            onClick={() => setTab("platform")}
          >
            Platform
          </button>
        </div>
      </div>

      {tab === "admin" ? (
        <ul className="kf-admin-inbox-feed" role="tabpanel">
          {adminFeed.length === 0 ? (
            <li className="kf-admin-inbox-empty">No administrative actions recorded yet.</li>
          ) : (
            adminFeed.map((row) => (
              <li key={row.id} className="kf-admin-inbox-feed__item">
                <div className="kf-admin-inbox-feed__main">
                  <p className="kf-admin-inbox-feed__label">{row.actionLabel}</p>
                  {row.targetLabel ? (
                    <p className="kf-admin-inbox-feed__sub">
                      {row.href ? (
                        <Link href={row.href} className="underline">
                          {row.targetLabel}
                        </Link>
                      ) : (
                        row.targetLabel
                      )}
                    </p>
                  ) : null}
                  <p className="kf-admin-inbox-feed__meta">
                    {row.adminName} · {formatKfDateTime(row.createdAt)}
                  </p>
                </div>
              </li>
            ))
          )}
        </ul>
      ) : (
        <ul className="kf-admin-inbox-feed" role="tabpanel">
          {platformFeed.length === 0 ? (
            <li className="kf-admin-inbox-empty">No recent product activity.</li>
          ) : (
            platformFeed.map((row) => (
              <li key={row.id} className="kf-admin-inbox-feed__item">
                <p className="kf-admin-inbox-feed__label">{row.eventType.replace(/_/g, " ")}</p>
                <p className="kf-admin-inbox-feed__sub">{row.listingName ?? "Discovery"}</p>
                <p className="kf-admin-inbox-feed__meta">
                  {row.userEmail ?? `Visitor …${row.visitorId}`} · {formatKfDateTime(row.createdAt)}
                </p>
              </li>
            ))
          )}
          <li className="kf-admin-inbox-feed__footer">
            <Link href="/admin/events" className="text-sm font-semibold text-[var(--kf-forest)] underline">
              Open full events log
            </Link>
          </li>
        </ul>
      )}
    </section>
  );
}