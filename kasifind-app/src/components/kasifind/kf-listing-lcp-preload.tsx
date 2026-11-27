import {
  buildListingImageDelivery,
  pickListingPageLcpImagePath,
} from "@/lib/kasifind/listing-image-delivery";

type Props = {
  profileImageUrl: string | null;
  siteOrigin: string | null;
};

/** Preload the listing hero WebP so LCP does not wait on client discovery. */
export function KfListingLcpPreload({ profileImageUrl, siteOrigin }: Props) {
  const storedPath = pickListingPageLcpImagePath(profileImageUrl);
  if (!storedPath) return null;

  const delivery = buildListingImageDelivery(storedPath, "hero", siteOrigin);

  if (delivery.srcSet && delivery.sizes) {
    return (
      <link
        rel="preload"
        as="image"
        href={delivery.src}
        imageSrcSet={delivery.srcSet}
        imageSizes={delivery.sizes}
        fetchPriority="high"
      />
    );
  }

  return <link rel="preload" as="image" href={delivery.src} fetchPriority="high" />;
}