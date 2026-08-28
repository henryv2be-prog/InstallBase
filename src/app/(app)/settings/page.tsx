import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/auth/logout-button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { PushNotificationToggle } from "@/components/pwa/push-toggle";
import { getExperienceLabel } from "@/lib/utils";
import { getVapidPublicKey } from "@/lib/vapid";
import { Badge } from "@/components/ui/badge";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { profile: true },
  });

  if (!user?.profile) redirect("/login");

  const profile = user.profile;

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
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Username</p>
            <p className="font-medium">@{profile.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Location</p>
            <p className="font-medium">
              {[profile.city, profile.country].filter(Boolean).join(", ") || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Experience</p>
            <p className="font-medium">{getExperienceLabel(profile.experienceLevel)}</p>
          </div>
          {profile.bio && (
            <div>
              <p className="text-sm text-gray-500">Bio</p>
              <p className="font-medium">{profile.bio}</p>
            </div>
          )}
          {profile.specialties.length > 0 && (
            <div>
              <p className="mb-2 text-sm text-gray-500">Specialties</p>
              <div className="flex flex-wrap gap-2">
                {profile.specialties.map((s) => (
                  <Badge key={s} variant="outline">{s}</Badge>
                ))}
              </div>
            </div>
          )}
          <Link href={`/profile/${profile.username}`}>
            <Button variant="outline">View public profile</Button>
          </Link>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent>
          <PushNotificationToggle vapidPublicKey={getVapidPublicKey()} />
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
          <p className="text-sm text-gray-500">
            Sign out of InstallBase on this device.
          </p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
