import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { MapPin, MessageCircle } from "lucide-react";
import { getProfileByUsername, getBookmarkedPosts } from "@/lib/queries";
import { getSession } from "@/lib/session";
import type { Session } from "next-auth";
import { PresenceLabel } from "@/components/presence/presence-avatar";
import { EditableProfileAvatar } from "@/components/profile/editable-profile-avatar";
import { Badge, ReputationBadge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostFeed } from "@/components/feed/post-card";
import { getReputationLabel, getExperienceLabel } from "@/lib/utils";
import { FollowButton } from "@/components/profile/follow-button";
import { signupHref } from "@/lib/auth-urls";
import { LogoutButton } from "@/components/auth/logout-button";
import { EmptyState } from "@/components/ui/empty-state";
import { FolderKanban, Bookmark } from "lucide-react";

interface ProfilePageProps {
  username: string;
  session?: Session | null;
}

export async function ProfileView({ username, session: sessionProp }: ProfilePageProps) {
  const session = sessionProp ?? await getSession();
  const profile = await getProfileByUsername(username, session?.user?.id);
  if (!profile) notFound();

  const user = profile.user;
  const bragPosts = user.posts.filter(
    (p) => p.type === "BRAG" || (p.type !== "QUESTION" && p.media.length > 0)
  );
  const questionPosts = user.posts.filter((p) => p.type === "QUESTION");
  const normalPosts = user.posts.filter((p) => p.type === "POST" || p.type === "VIDEO");
  const isOwnProfile = session?.user?.id === user.id;
  const alreadyFollowing = profile.alreadyFollowing;
  const followsYou = profile.followsYou;

  const savedPosts = isOwnProfile && session?.user?.id
    ? await getBookmarkedPosts(session.user.id)
    : [];

  const tabCounts = {
    posts: normalPosts.length,
    brags: bragPosts.length,
    projects: user.projects.length,
    questions: questionPosts.length,
    saved: savedPosts.length,
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="glass-card overflow-hidden rounded-2xl">
        <div className="relative h-32 bg-gradient-to-r from-blue-600 to-blue-800 sm:h-48">
          {profile.coverImage && (
            <Image src={profile.coverImage} alt="Cover" fill className="object-cover" />
          )}
        </div>
        <div className="relative px-5 pb-5">
          <EditableProfileAvatar
            image={user.image}
            name={user.name}
            lastSeenAt={user.lastSeenAt}
            editable={isOwnProfile}
            wrapperClassName="-mt-12"
            className="h-24 w-24 border-4 border-white dark:border-gray-900"
            fallbackClassName="text-2xl"
            ringClassName="bottom-1 right-1 border-white dark:border-gray-900"
          />

          <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{user.name}</h1>
                {profile.verified && <VerifiedBadge />}
              </div>
              <p className="text-muted">@{profile.username}</p>
              <PresenceLabel lastSeenAt={user.lastSeenAt} className="mt-1 block text-sm" />
              {(profile.city || profile.country) && (
                <p className="mt-1 flex items-center gap-1 text-sm text-muted">
                  <MapPin className="h-3.5 w-3.5" />
                  {[profile.city, profile.country].filter(Boolean).join(", ")}
                </p>
              )}
            </div>
            <div className="flex gap-2">
              {!isOwnProfile && (
                <>
                  <FollowButton
                    userId={user.id}
                    currentUserId={session?.user?.id}
                    initialFollowing={alreadyFollowing}
                    followsYou={followsYou}
                    targetName={user.name ?? undefined}
                  />
                  {session?.user ? (
                    <Link href={`/activity?tab=messages&user=${profile.username}`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Button>
                    </Link>
                  ) : (
                    <Button variant="outline" size="sm" asChild>
                      <Link href={signupHref(`/profile/${profile.username}`)}>
                        <MessageCircle className="h-4 w-4" />
                        Message
                      </Link>
                    </Button>
                  )}
                </>
              )}
              {isOwnProfile && (
                <div className="flex flex-wrap gap-2">
                  <Link href="/settings">
                    <Button variant="outline" size="sm">Edit Profile</Button>
                  </Link>
                  <div className="sm:hidden">
                    <LogoutButton compact />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <ReputationBadge score={profile.reputationScore} level={profile.reputationLevel} />
            <Badge variant="secondary">🏆 {profile.bragCount} Brags</Badge>
            <Badge variant="success">✓ {profile.helpfulAnswers} Helpful Answers</Badge>
            <Link href={`/profile/${profile.username}/follows?list=followers`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                👥 {user._count.followers} Followers
              </Badge>
            </Link>
            <Link href={`/profile/${profile.username}/follows?list=following`}>
              <Badge variant="outline" className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800">
                {user._count.following} Following
              </Badge>
            </Link>
          </div>

          <p className="mt-2 text-sm font-medium text-primary">
            {getReputationLabel(profile.reputationLevel)}
          </p>

          {profile.bio && (
            <p className="mt-3 text-foreground/80">{profile.bio}</p>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            {profile.specialties.map((s) => (
              <Badge key={s} variant="outline">{s}</Badge>
            ))}
          </div>

          <p className="mt-2 text-sm text-muted">
            Experience: {getExperienceLabel(profile.experienceLevel)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="posts" className="mt-6">
        <TabsList className="w-full flex-wrap h-auto gap-1">
          <TabsTrigger value="posts">Posts ({tabCounts.posts})</TabsTrigger>
          <TabsTrigger value="brags">Brags ({tabCounts.brags})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({tabCounts.projects})</TabsTrigger>
          <TabsTrigger value="questions">Questions ({tabCounts.questions})</TabsTrigger>
          {isOwnProfile && <TabsTrigger value="saved">Saved ({tabCounts.saved})</TabsTrigger>}
        </TabsList>
        <TabsContent value="posts">
          <PostFeed
            posts={normalPosts}
            currentUserId={session?.user?.id}
            emptyTitle="No posts yet"
            emptyDescription={
              isOwnProfile
                ? "Share installs, tips, or site photos."
                : `${user.name ?? profile.username} hasn't shared any posts yet.`
            }
            emptyAction={isOwnProfile ? { label: "Create post", href: "/create" } : undefined}
          />
        </TabsContent>
        <TabsContent value="brags">
          {bragPosts.length > 0 && (
            <p className="mb-3 text-sm text-muted">Brags on a profile never expire.</p>
          )}
          <PostFeed
            posts={bragPosts}
            currentUserId={session?.user?.id}
            emptyTitle="No brags yet"
            emptyDescription={
              isOwnProfile
                ? "Post an install with photos to start collecting brag points."
                : `${user.name ?? profile.username} hasn't shared any brags yet.`
            }
            emptyAction={isOwnProfile ? { label: "Share an install", href: "/create" } : undefined}
          />
        </TabsContent>
        <TabsContent value="projects">
          <div className="space-y-4">
            {user.projects.length === 0 ? (
              <EmptyState
                icon={FolderKanban}
                title="No projects yet"
                description={
                  isOwnProfile
                    ? "Document a full job with equipment lists and photos."
                    : `${user.name ?? profile.username} hasn't published any projects yet.`
                }
              />
            ) : (
              user.projects.map((project) => (
                <Link
                  key={project.id}
                  href={`/projects/${project.slug}`}
                  className="glass-card block rounded-2xl p-5 transition-shadow hover:shadow-md"
                >
                  <h3 className="font-bold">{project.title}</h3>
                  <p className="mt-1 text-sm text-muted line-clamp-2">{project.description}</p>
                </Link>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="questions">
          <PostFeed
            posts={questionPosts}
            currentUserId={session?.user?.id}
            emptyTitle="No questions yet"
            emptyDescription={
              isOwnProfile
                ? "Ask the community for help with tricky installs."
                : `${user.name ?? profile.username} hasn't asked any questions yet.`
            }
            emptyAction={isOwnProfile ? { label: "Ask a question", href: "/create" } : undefined}
          />
        </TabsContent>
        {isOwnProfile && (
          <TabsContent value="saved">
            {savedPosts.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No saved posts yet"
                description="Tap the menu on any post and choose Save post."
              />
            ) : (
              <PostFeed posts={savedPosts} currentUserId={session?.user?.id} />
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
