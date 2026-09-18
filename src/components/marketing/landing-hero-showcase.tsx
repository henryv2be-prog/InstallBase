import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { MediaImage } from "@/components/ui/media-image";
import { HeroFeaturedMedia } from "@/components/marketing/hero-featured-media";
import { LANDING_EXAMPLE_POSTS } from "@/components/marketing/landing-post-preview";
import type { PostCardData } from "@/lib/queries";
import { isVideoMedia } from "@/lib/media";
import { cn } from "@/lib/utils";

const SHOWCASE_LIMIT = 5;

type ShowcaseItem = {
  key: string;
  imageUrl: string;
  imageAlt: string;
  mediaType?: string;
  authorName: string;
  username: string;
  authorImage: string | null;
  label: string;
  caption: string;
  postType: PostCardData["type"] | "work" | "question" | "brag";
};

interface LandingHeroShowcaseProps {
  posts?: PostCardData[];
}

function postTypeLabel(type: ShowcaseItem["postType"]) {
  switch (type) {
    case "QUESTION":
    case "question":
      return "Question";
    case "BRAG":
    case "brag":
      return "Brag";
    case "VIDEO":
      return "How I Did It";
    case "PROJECT":
      return "Project";
    default:
      return "Install";
  }
}

function postTypeBadgeVariant(type: ShowcaseItem["postType"]) {
  switch (type) {
    case "QUESTION":
    case "question":
      return "question" as const;
    case "BRAG":
    case "brag":
      return "brag" as const;
    default:
      return "secondary" as const;
  }
}

function pickImageMedia(post: PostCardData) {
  return post.media.find((item) => !isVideoMedia(item.type, item.url)) ?? null;
}

function toShowcaseItem(post: PostCardData, media: NonNullable<ReturnType<typeof pickImageMedia>>): ShowcaseItem {
  const profile = post.author.profile;
  const trade = profile?.specialties[0] ?? postTypeLabel(post.type);

  return {
    key: media.id,
    imageUrl: media.url,
    imageAlt: media.caption ?? `${trade} install by ${post.author.name ?? "installer"}`,
    mediaType: media.type,
    authorName: post.author.name ?? profile?.username ?? "Installer",
    username: profile?.username ?? "installer",
    authorImage: post.author.image,
    label: trade,
    caption: post.title ?? post.content,
    postType: post.type,
  };
}

function pickShowcaseItems(sources: PostCardData[]): ShowcaseItem[] {
  const items: ShowcaseItem[] = [];
  const seenMedia = new Set<string>();

  for (const post of sources) {
    const media = pickImageMedia(post);
    if (!media || seenMedia.has(media.id)) continue;
    seenMedia.add(media.id);
    items.push(toShowcaseItem(post, media));
    if (items.length >= SHOWCASE_LIMIT) break;
  }

  return items;
}

function demoShowcaseItems(): ShowcaseItem[] {
  return LANDING_EXAMPLE_POSTS.slice(0, SHOWCASE_LIMIT).map((post) => ({
    key: post.id,
    imageUrl: post.image,
    imageAlt: post.imageAlt,
    authorName: post.trade,
    username: post.trade.toLowerCase().replace(/\s+/g, ""),
    authorImage: null,
    label: post.trade,
    caption: post.title ?? post.content,
    postType: post.type,
  }));
}

function AuthorAvatar({
  name,
  image,
  className,
}: {
  name: string;
  image: string | null;
  className?: string;
}) {
  const initials = name
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt=""
        className={cn("rounded-full object-cover ring-1 ring-white/20", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500/40 to-cyan-500/30 text-[10px] font-bold uppercase text-white",
        className
      )}
      aria-hidden
    >
      {initials}
    </div>
  );
}

function ShowcaseCaption({ item }: { item: ShowcaseItem }) {
  return (
    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/50 to-transparent px-3 pb-3 pt-10 sm:px-4 sm:pb-4">
      <div className="flex items-center gap-2.5">
        <AuthorAvatar name={item.authorName} image={item.authorImage} className="h-8 w-8 shrink-0 sm:h-9 sm:w-9" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="truncate text-sm font-semibold text-white">{item.authorName}</p>
            <Badge variant="outline" className="border-white/20 bg-white/10 text-[10px] text-white">
              {item.label}
            </Badge>
          </div>
          <p className="truncate text-xs text-white/75">@{item.username}</p>
        </div>
      </div>
      <p className="mt-2 line-clamp-2 text-sm leading-snug text-white/90">{item.caption}</p>
    </div>
  );
}

function ThumbnailTile({ item, className }: { item: ShowcaseItem; className?: string }) {
  return (
    <div
      className={cn(
        "relative shrink-0 overflow-hidden rounded-lg bg-muted ring-1 ring-border",
        className
      )}
    >
      <MediaImage src={item.imageUrl} alt={item.imageAlt} fill className="object-cover" sizes="80px" />
    </div>
  );
}

/** Mobile-first live install showcase — featured photo + scrollable community strip. */
export function LandingHeroShowcase({ posts = [] }: LandingHeroShowcaseProps) {
  const items = pickShowcaseItems(posts);
  const showcase = items.length > 0 ? items : demoShowcaseItems();
  const featured = showcase[0];
  const more = showcase.slice(1);

  return (
    <div className="glass-card glow-border overflow-hidden">
      <div className="flex items-center justify-between border-b border-border bg-card/60 px-3 py-2 sm:px-4">
        <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600 dark:text-cyan-400 sm:text-[11px]">
          Live from the community
        </p>
        <Link
          href="/feed"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted transition-colors hover:text-foreground"
        >
          Open feed
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="relative aspect-[4/3] w-full bg-muted sm:aspect-[5/4]">
        <HeroFeaturedMedia
          url={featured.imageUrl}
          type={featured.mediaType}
          alt={featured.imageAlt}
          priority
        />
        <ShowcaseCaption item={featured} />
      </div>

      {more.length > 0 && (
        <div className="border-t border-border bg-card/40 px-3 py-3 sm:px-4">
          <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted">
            More installs
          </p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {more.map((item) => (
              <div key={item.key} className="w-[4.75rem] shrink-0 sm:w-20">
                <ThumbnailTile item={item} className="aspect-square" />
                <p className="mt-1 truncate text-[10px] text-muted">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="border-t border-border px-3 py-2.5 sm:px-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={postTypeBadgeVariant(featured.postType)}>
            {postTypeLabel(featured.postType)}
          </Badge>
          <p className="text-xs text-muted">Real posts from installers on InstallBase</p>
        </div>
      </div>
    </div>
  );
}
