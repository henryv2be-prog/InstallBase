import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { InstallInstructions } from "@/components/pwa/install-instructions";
import { PushNotificationToggle } from "@/components/pwa/push-toggle";
import { ProfileSettingsForm } from "@/components/settings/profile-settings-form";
import { PlatformPurposesForm } from "@/components/settings/platform-purposes-form";
import { AvatarUpload } from "@/components/settings/avatar-upload";
import { PasswordChangeForm } from "@/components/settings/password-change-form";
import { getCanonicalHost } from "@/lib/canonical-host";
import { getVapidPublicKey } from "@/lib/vapid";
import { getUserPlatformRoles } from "@/lib/queries";
import { needsProfessionalDetails } from "@/lib/platform-roles";
import { GuestJoinCard } from "@/components/auth/guest-cta";
import { LogoutButton } from "@/components/auth/logout-button";

export const metadata = { title: "Settings" };
export const dynamic = "force-dynamic";

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
  const platformRoles = await getUserPlatformRoles(user.id);
  const showProfessionalFields = needsProfessionalDetails(platformRoles);
  const vapidPublicKey = getVapidPublicKey();
  const canonicalHost = getCanonicalHost();

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
          <CardTitle>How I use InstallBase</CardTitle>
        </CardHeader>
        <CardContent>
          <PlatformPurposesForm initialRoles={platformRoles} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AvatarUpload name={user.name} image={user.image} />
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
            openToWork={profile.openToWork}
            availableForContract={profile.availableForContract}
            availableForSubcontract={profile.availableForSubcontract}
            willingToTravel={profile.willingToTravel}
            serviceRadiusKm={profile.serviceRadiusKm}
            employmentStatus={profile.employmentStatus}
            certifications={profile.certifications}
            showProfessionalFields={showProfessionalFields}
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
          <InstallInstructions canonicalHost={canonicalHost} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <PasswordChangeForm />
          <p className="text-sm text-muted">Sign out of InstallBase on this device.</p>
          <LogoutButton />
        </CardContent>
      </Card>
    </div>
  );
}
