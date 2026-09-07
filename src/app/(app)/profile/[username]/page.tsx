import { ProfileView } from "@/components/profile/profile-view";
import { auth } from "@/lib/auth";
import { markNotificationsReadForUser } from "@/lib/notification-read";

interface ProfilePageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params;
  return { title: `@${username}` };
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params;
  const session = await auth();
  if (session?.user?.id) {
    await markNotificationsReadForUser(session.user.id, { link: `/profile/${username}` });
  }
  return <ProfileView username={username} />;
}
