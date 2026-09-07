import { Suspense } from "react";
import Link from "next/link";
import { isToday } from "date-fns";
import { auth } from "@/lib/auth";
import { getNotifications, getConversations, getProfileByUsername, getOrCreateConversation } from "@/lib/queries";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { RelativeTime } from "@/components/ui/relative-time";
import { MarkReadButton } from "@/components/notifications/mark-read-button";
import { NotificationItem } from "@/components/notifications/notification-item";
import { EnableAlertsCta } from "@/components/pwa/enable-alerts-cta";
import { getVapidPublicKey } from "@/lib/vapid";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { PresenceAvatar, PresenceLabel } from "@/components/presence/presence-avatar";
import { ActivityTabs } from "@/components/activity/activity-tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { Bell, MessageSquare } from "lucide-react";
import { notFound, redirect } from "next/navigation";

export const metadata = { title: "Activity" };
export const dynamic = "force-dynamic";

interface ActivityPageProps {
  searchParams: Promise<{ tab?: string; user?: string }>;
}

export default async function ActivityPage({ searchParams }: ActivityPageProps) {
  const session = await auth();
  const userId = session?.user?.id;
  const { tab = "notifications", user: username } = await searchParams;

  if (!userId) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <h1 className="mb-4 text-2xl font-bold">Activity</h1>
        <GuestJoinCard
          title="Activity is for members"
          body="Join free to get notified when someone likes, comments, or messages you."
          next="/activity"
        />
      </div>
    );
  }

  if (username) {
    const profile = await getProfileByUsername(username);
    if (!profile) notFound();
    if (profile.userId === userId) redirect("/activity?tab=messages");
    const conversation = await getOrCreateConversation(userId, profile.userId);
    redirect(`/messages/${conversation.id}`);
  }

  const showMessages = tab === "messages";

  return (
    <div className="mx-auto max-w-2xl animate-fade-in">
      <h1 className="mb-2 text-2xl font-bold">Activity</h1>
      <p className="mb-4 text-sm text-muted">Notifications and messages in one place</p>

      <Suspense fallback={null}>
        <ActivityTabs />
      </Suspense>

      {showMessages ? (
        <MessagesList userId={userId} />
      ) : (
        <NotificationsList userId={userId} />
      )}
    </div>
  );
}

async function NotificationsList({ userId }: { userId: string }) {
  const notifications = await getNotifications(userId);
  const unreadCount = notifications.filter((n) => !n.read).length;
  const todayNotifications = notifications.filter((n) => isToday(n.createdAt));
  const earlierNotifications = notifications.filter((n) => !isToday(n.createdAt));

  const renderNotification = (notification: (typeof notifications)[number]) => (
    <NotificationItem
      key={notification.id}
      id={notification.id}
      href={notification.link ?? "#"}
      read={notification.read}
      className={`flex items-center gap-3 rounded-xl border p-4 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
        notification.read
          ? "border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900"
          : "border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30"
      }`}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.actor?.image ?? undefined} />
        <AvatarFallback>{getInitials(notification.actor?.name ?? "S")}</AvatarFallback>
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
    </NotificationItem>
  );

  return (
    <>
      <div className="mb-4 flex items-center justify-between">
        {unreadCount > 0 ? (
          <>
            <p className="text-sm text-gray-500">{unreadCount} unread</p>
            <MarkReadButton />
          </>
        ) : (
          <p className="text-sm text-gray-500">All caught up</p>
        )}
      </div>
      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications yet"
          description="When someone interacts with your posts, you'll see it here."
        >
          <div className="mt-4">
            <EnableAlertsCta vapidPublicKey={getVapidPublicKey()} />
          </div>
        </EmptyState>
      ) : (
        <div className="space-y-6">
          {todayNotifications.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Today</h2>
              <div className="space-y-2">
                {todayNotifications.map(renderNotification)}
              </div>
            </section>
          )}
          {earlierNotifications.length > 0 && (
            <section>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Earlier</h2>
              <div className="space-y-2">
                {earlierNotifications.map(renderNotification)}
              </div>
            </section>
          )}
        </div>
      )}
    </>
  );
}

async function MessagesList({ userId }: { userId: string }) {
  const conversations = await getConversations(userId);

  return (
    <div className="space-y-2">
      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Visit an installer's profile to start a conversation."
          action={{ label: "Find installers", href: "/discover?tab=people" }}
        />
      ) : (
        conversations.map(({ conversation }) => {
          const other = conversation.participants.find((p) => p.userId !== userId)?.user;
          const lastMessage = conversation.messages[0];

          return (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 hover:shadow-sm dark:border-gray-800 dark:bg-gray-900"
            >
              <PresenceAvatar src={other?.image} name={other?.name} lastSeenAt={other?.lastSeenAt} />
              <div className="flex-1 overflow-hidden">
                <p className="font-semibold">{other?.name}</p>
                <p className="truncate text-sm text-gray-500">{lastMessage?.content ?? "No messages yet"}</p>
                <PresenceLabel lastSeenAt={other?.lastSeenAt} className="text-xs" />
              </div>
              {lastMessage && (
                <span className="text-xs text-gray-400">
                  <RelativeTime date={lastMessage.createdAt} />
                </span>
              )}
            </Link>
          );
        })
      )}
    </div>
  );
}
