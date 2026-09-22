import type { AdCreative } from "@/lib/advertising/types";

export type InterleavedFeedItem<T> =
  | { kind: "item"; value: T; postIndex: number }
  | { kind: "ad"; ad: AdCreative; afterPostIndex: number; adSlot: number };

/** Insert feed ads after every (minPostsBetweenAds + 1) posts, same cadence as classic feed. */
export function interleaveFeedWithAds<T>(
  items: T[],
  betweenAds: AdCreative[],
  minPostsBetweenAds: number
): InterleavedFeedItem<T>[] {
  if (items.length === 0) return [];

  const result: InterleavedFeedItem<T>[] = [];
  let adIndex = 0;

  items.forEach((value, index) => {
    result.push({ kind: "item", value, postIndex: index });
    const shouldInsertAd =
      betweenAds.length > 0 &&
      adIndex < betweenAds.length &&
      index > 0 &&
      (index + 1) % (minPostsBetweenAds + 1) === 0;

    if (shouldInsertAd) {
      result.push({
        kind: "ad",
        ad: betweenAds[adIndex],
        afterPostIndex: index,
        adSlot: adIndex,
      });
      adIndex += 1;
    }
  });

  return result;
}
