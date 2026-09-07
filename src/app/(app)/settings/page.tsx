import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PushNotificationToggle } from "@/components/pwa/push-toggle";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { getVapidPublicKey } from "@/lib/vapid";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    return (
      <div className="mx-auto max-w-lg animate-fade-in">
        <h1 className="mb-4 text-2xl font-bold">Settings</h1>
        <GuestJoinCard
          title="Settings are for members"
          body="Join free to create a profile and manage your account."
          next="/settings"
        />
      </div>
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user?.profile) redirect("/login");

  const profile = user.profile;
  const vapidPublicKey = getVapidPublicKey();

  return (
    <div className="mx-auto max-w-2xl space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-muted">Manage your InstallBase account</p>
        </div>
        <ThemeToggle />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <ProfileSettingsForm
            name={user.name ?? ""}
            username={profile.username}
            email={user.email}
            bio={profile.bio}
            city={profile.city}
            country={profile.country}
            experience={profile.experienceLevel}
            specialties={profile.specialties}
            website={profile.website}
          />
          <div className="mt-4">
            <Link href={`/profile/${profile.username}`}>
              <Button variant="outline">View public profile</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          {vapidPublicKey ? (
            <PushNotificationToggle vapidPublicKey={vapidPublicKey} />
          ) : (
            <p className="text-sm text-muted">Push notifications are not configured on this server.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Install app</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted">
          <p>
            InstallBase can run like a native app. On iPhone, tap Share → Add to Home Screen.
            On Android, use the browser menu → Install app / Add to Home screen.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted">Sign out of InstallBase on this device.</p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
