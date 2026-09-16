"use client";

import { PushNotificationToggle } from "@/components/pwa/push-toggle";
import { DailyDigestToggle } from "@/components/settings/daily-digest-toggle";

export function NotificationsSettings({
  vapidPublicKey,
  dailyDigestEnabled,
}: {
  vapidPublicKey: string;
  dailyDigestEnabled: boolean;
}) {
  const scrollToDailyDigest = () => {
    const el = document.getElementById("daily-digest-settings");
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    el?.classList.add("ring-2", "ring-blue-500/60", "ring-offset-2");
    window.setTimeout(() => {
      el?.classList.remove("ring-2", "ring-blue-500/60", "ring-offset-2");
    }, 3000);
  };

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted">
        Phone alerts cover messages, follows, and post interactions. Daily community updates are separate — you can
        turn those off without missing messages.
      </p>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold">Messages &amp; activity alerts</h3>
        <PushNotificationToggle
          vapidPublicKey={vapidPublicKey}
          onPreferDailyDigestOff={scrollToDailyDigest}
        />
      </section>

      <section id="daily-digest-settings" className="scroll-mt-6 rounded-lg transition-shadow">
        <DailyDigestToggle enabled={dailyDigestEnabled} />
      </section>
    </div>
  );
}
