import { headers } from "next/headers";
import { getSession } from "@/lib/session";
import { fetchAdsForPlacement } from "@/lib/advertising/internal-provider";
import { getTargetingContext } from "@/lib/advertising/context";
import { getAdSettings } from "@/lib/advertising/settings";
import { AD_PLACEMENTS } from "@/lib/advertising/placements";
import type { PostCardData } from "@/lib/queries";
import { ImmersiveFeed } from "@/components/feed/immersive/immersive-feed";

function detectDevice(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

interface ImmersiveFeedWithAdsProps {
  initialPosts: PostCardData[];
  initialCursor: string | null;
  initialHasMore: boolean;
  tab: "popular" | "following";
  currentUserId?: string;
  followingIds?: Set<string>;
}

export async function ImmersiveFeedWithAds(props: ImmersiveFeedWithAdsProps) {
  const settings = await getAdSettings();
  const session = await getSession();
  const targeting = await getTargetingContext(session?.user?.id);
  const h = await headers();
  const device = detectDevice(h.get("user-agent") ?? "");
  const maxAds =
    device === "mobile" ? settings.mobileMaxFeedAds : settings.desktopMaxFeedAds;

  let betweenPlacement =
    device === "mobile" ? AD_PLACEMENTS.MOBILE_FEED : AD_PLACEMENTS.FEED_BETWEEN_POSTS;

  let betweenAds = settings.adsEnabled
    ? await fetchAdsForPlacement(betweenPlacement, {
        limit: Math.min(maxAds, settings.maxFeedAds),
        device,
        targeting,
      })
    : [];

  if (settings.adsEnabled && betweenAds.length === 0 && device === "mobile") {
    betweenPlacement = AD_PLACEMENTS.FEED_BETWEEN_POSTS;
    betweenAds = await fetchAdsForPlacement(betweenPlacement, {
      limit: Math.min(maxAds, settings.maxFeedAds),
      device,
      targeting,
    });
  }

  return (
    <ImmersiveFeed
      {...props}
      betweenAds={betweenAds}
      betweenAdsPlacementKey={betweenPlacement}
      minPostsBetweenAds={settings.minPostsBetweenAds}
    />
  );
}
