"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  kfAdminRemovePushDevice,
  kfAdminSaveNotificationSettings,
  kfAdminSendTestPush,
} from "@/lib/kasifind/admin-notification-actions";
import { KfAdminPushSetup } from "@/components/kasifind/admin/kf-admin-push-setup";

type EventRow = {
  eventType: string;
  label: string;
  description: string;
  category: string;
  priority: string;
  inAppEnabled: boolean;
  pushEnabled: boolean;
};

type Device = {
  id: string;
  active: boolean;
  deviceLabel: string | null;
  userAgent: string | null;
  lastSuccessAt: Date | null;
};

type Props = {
  pushMasterEnabled: boolean;
  events: EventRow[];
  devices: Device[];
  vapidConfigured: boolean;
};

export function KfAdminNotificationSettingsForm({
  pushMasterEnabled,
  events,
  devices,
  vapidConfigured,
}: Props) {
  const router = useRouter();
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const result = await kfAdminSaveNotificationSettings(formData);
    if (result && "error" in result) setMessage(result.error);
    else {
      setMessage("Settings saved.");
      router.refresh();
    }
  }

  async function testPush() {
    const result = await kfAdminSendTestPush();
    if (result && "error" in result) setMessage(result.error);
    else setMessage("Test push sent to your devices.");
  }

  async function removeDevice(id: string) {
    await kfAdminRemovePushDevice(id);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <KfAdminPushSetup vapidConfigured={vapidConfigured} />

      <section className="kf-card p-4">
        <h2 className="text-base font-semibold text-[var(--kf-ink)]">Registered devices</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {devices.length === 0 ? (
            <li className="text-[var(--kf-muted)]">No devices registered yet.</li>
          ) : (
            devices.map((d) => (
              <li
                key={d.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b border-[var(--kf-line)] pb-2"
              >
                <span>
                  {d.deviceLabel || d.userAgent?.slice(0, 60) || "Device"}{" "}
                  <span className="text-[var(--kf-muted)]">({d.active ? "active" : "inactive"})</span>
                </span>
                {d.active ? (
                  <button
                    type="button"
                    className="kf-btn kf-btn-ghost text-xs"
                    onClick={() => void removeDevice(d.id)}
                  >
                    Remove
                  </button>
                ) : null}
              </li>
            ))
          )}
        </ul>
        <button type="button" className="kf-btn kf-btn-outline mt-4 text-sm" onClick={() => void testPush()}>
          Send test notification
        </button>
      </section>

      <form className="kf-card space-y-4 p-4" onSubmit={(e) => void onSubmit(e)}>
        <h2 className="text-base font-semibold text-[var(--kf-ink)]">Your notification rules</h2>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="pushMasterEnabled" defaultChecked={pushMasterEnabled} />
          Master switch — allow Android push for this admin account
        </label>

        <div className="kf-admin-table-wrap">
          <table className="kf-admin-data-table text-sm">
            <thead>
              <tr>
                <th>Event</th>
                <th>Category</th>
                <th>In-app</th>
                <th>Push</th>
              </tr>
            </thead>
            <tbody>
              {events.map((ev) => (
                <tr key={ev.eventType}>
                  <td>
                    <div className="font-medium">{ev.label}</div>
                    <div className="text-xs text-[var(--kf-muted)]">{ev.description}</div>
                  </td>
                  <td>{ev.category}</td>
                  <td>
                    <input
                      type="checkbox"
                      name={`inApp:${ev.eventType}`}
                      defaultChecked={ev.inAppEnabled}
                    />
                  </td>
                  <td>
                    <input
                      type="checkbox"
                      name={`push:${ev.eventType}`}
                      defaultChecked={ev.pushEnabled}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <button type="submit" className="kf-btn kf-btn-primary text-sm">
          Save preferences
        </button>
        {message ? <p className="text-sm text-[var(--kf-ink)]">{message}</p> : null}
      </form>
    </div>
  );
}