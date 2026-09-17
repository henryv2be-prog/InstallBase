import { ProfileView } from "@/components/profile/profile-view";
import { getSession } from "@/lib/session";
import { deferMarkNotificationsReadForUser } from "@/lib/notification-read";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await getSession();
  if (session?.user?.id) {
    deferMarkNotificationsReadForUser(session.user.id, { link: `/profile/${username}` });
  }
  return <ProfileView username={username} session={session} />;
}
