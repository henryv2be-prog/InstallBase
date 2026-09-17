import { fetchAdsForPlacement } from "@/lib/advertising/internal-provider";
import { getTargetingContext } from "@/lib/advertising/context";
import { getSession } from "@/lib/session";
import { getAdSettings } from "@/lib/advertising/settings";
import type { AdPlacementKey } from "@/lib/advertising/placements";
import { AdRenderer } from "@/components/ads/ad-renderer";
import { headers } from "next/headers";

interface AdSlotProps {
  placement: AdPlacementKey;
  limit?: number;
  className?: string;
}

function detectDevice(userAgent: string): "mobile" | "desktop" | "tablet" {
  const ua = userAgent.toLowerCase();
  if (/ipad|tablet/.test(ua)) return "tablet";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  return "desktop";
}

export async function AdSlot({ placement, limit = 1, className }: AdSlotProps) {
  const settings = await getAdSettings();
  if (!settings.adsEnabled) return null;

  const session = await getSession();
  const targeting = await getTargetingContext(session?.user?.id);
  const h = await headers();
  const device = detectDevice(h.get("user-agent") ?? "");

  const ads = await fetchAdsForPlacement(placement, {
    limit,
    device,
    targeting,
  });

  if (ads.length === 0) return null;

  return (
    <div className={className}>
      {ads.map((ad) => (
        <AdRenderer key={ad.id} ad={ad} placementKey={placement} />
      ))}
    </div>
  );
}
