import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, MessageCircle } from "lucide-react";
import { getProfileByUsername } from "@/lib/queries";
import { auth } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, ReputationBadge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostFeed } from "@/components/feed/post-card";
import { getInitials, getReputationLabel, getExperienceLabel } from "@/lib/utils";
import { FollowButton } from "@/components/profile/follow-button";

interface ProfilePageProps {
  username: string;
}

export async function ProfileView({ username }: ProfilePageProps) {
  const profile = await getProfileByUsername(username);
  if (!profile) notFound();

  const session = await auth();
  const user = profile.user;
  const bragPosts = user.posts.filter((p) => p.type === "BRAG");
  const questionPosts = user.posts.filter((p) => p.type === "QUESTION");
  const normalPosts = user.posts.filter((p) => p.type === "POST" || p.type === "VIDEO");
  const isOwnProfile = session?.user?.id === user.id;
  const alreadyFollowing = session?.user?.id
    ? user.followers.some((f) => f.followerId === session.user!.id)
    : false;
  const followsYou = session?.user?.id
    ? user.following.some((f) => f.followingId === session.user!.id)
    : false;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800 sm:h-48">
          {profile.coverImage && (
            <Image src={profile.coverImage} alt="Cover" fill className="object-cover" />
          )}
        </div>
        <div className="relative px-5 pb-5">
          <Avatar className="-mt-12 h-24 w-24 border-4 border-white dark:border-gray-900">
            <AvatarImage src={user.image ?? undefined} />
            <AvatarFallback className="text-2xl">{getInitials(user.name ?? "U")}</AvatarFallback>
          </Avatar>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {profile.verified && <VerifiedBadge />}
              </div>
              <p className="text-gray-500">@{profile.username}</p>
              {(profile.city || profile.country) && (
                <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!isOwnProfile && session?.user && (
                <>
                  <FollowButton
                    userId={user.id}
                    initialFollowing={alreadyFollowing}
                    followsYou={followsYou}
                  />
                  <Link href={`/messages?user=${profile.username}`}>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="h-4 w-4" />
                      Message
                    </Button>
                  </Link>
                </>
              )}
              {isOwnProfile && (
                <Link href="/settings">
                  <Button variant="outline" size="sm">Edit Profile</Button>
                </Link>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <ReputationBadge score={profile.reputationScore} level={profile.reputationLevel} />
            <Badge variant="secondary">🏆 {profile.bragCount} Brags</Badge>
            <Badge variant="success">✓ {profile.helpfulAnswers} Helpful Answers</Badge>
            <Link href={`/profile/${profile.username}/follows?list=followers`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                👥 {user.followers.length} Followers
              </Badge>
            </Link>
            <Link href={`/profile/${profile.username}/follows?list=following`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                {user.following.length} Following
              </Badge>
            </Link>
          </div>

          <p className="mt-2 text-sm font-medium text-blue-600">
            {getReputationLabel(profile.reputationLevel)}
          </p>

          {profile.bio && (
            <p className="mt-3 text-gray-700 dark:text-gray-300">{profile.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {profile.specialties.map((s) => (
              <Badge key={s} variant="outline">{s}</Badge>
            ))}
          </div>

          <p className="mt-2 text-sm text-gray-500">
            Experience: {getExperienceLabel(profile.experienceLevel)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full">
          <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
          <TabsTrigger value="brags" className="flex-1">Brags</TabsTrigger>
          <TabsTrigger value="projects" className="flex-1">Projects</TabsTrigger>
          <TabsTrigger value="questions" className="flex-1">Questions</TabsTrigger>
        </TabsList>
        <TabsContent value="posts">
          <PostFeed posts={normalPosts} currentUserId={session?.user?.id} />
        </TabsContent>
        <TabsContent value="brags">
          {bragPosts.length > 0 && (
            <p className="mb-3 text-sm text-muted">Brags on a profile never expire.</p>
          )}
          <PostFeed posts={bragPosts} currentUserId={session?.user?.id} />
        </TabsContent>
        <TabsContent value="projects">
          <div className="space-y-4">
            {user.projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.slug}`}
                className="block rounded-2xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md dark:border-gray-800 dark:bg-gray-900"
              >
                <h3 className="font-bold">{project.title}</h3>
                <p className="mt-1 text-sm text-gray-500 line-clamp-2">{project.description}</p>
              </Link>
            ))}
          </div>
        </TabsContent>
        <TabsContent value="questions">
          <PostFeed posts={questionPosts} currentUserId={session?.user?.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
