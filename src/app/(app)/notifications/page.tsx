import Link from "next/link";
import { auth } from "@/lib/auth";
import { getNotifications } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MarkReadButton } from "@/components/notifications/mark-read-button";
import { EnableAlertsCta } from "@/components/pwa/enable-alerts-cta";
import { getVapidPublicKey } from "@/lib/vapid";
import { redirect } from "next/navigation";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");
  const notifications = await getNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        {unreadCount > 0 && <MarkReadButton />}
      </div>

      <div className="space-y-2">
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 p-12 text-center dark:border-gray-700">
            <p className="text-gray-500">No notifications yet</p>
            <p className="mt-1 text-sm text-muted">Turn on alerts so you see messages and comments on your phone.</p>
            <EnableAlertsCta vapidPublicKey={getVapidPublicKey()} />
          </div>
        ) : (
          notifications.map((notification) => (
            <Link
              key={notification.id}
              href={notification.link ?? "#"}
              className={`flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                notification.read
                  ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
                  : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
              }`}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage src={notification.actor?.image ?? undefined} />
                <AvatarFallback>
                  {getInitials(notification.actor?.name ?? "S")}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <p className="text-sm">
                  <span className="font-semibold">{notification.actor?.name ?? "Someone"}</span>{" "}
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">
                  <RelativeTime date={notification.createdAt} />
                </p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
