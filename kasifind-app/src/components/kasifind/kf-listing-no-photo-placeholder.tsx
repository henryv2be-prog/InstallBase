import {
  LISTING_NO_PHOTO_PLACEHOLDER_PATH,
  listingNoPhotoAlt,
} from "@/lib/kasifind/listing-no-photo-placeholder";

type Props = {
  displayName: string;
  className?: string;
  priority?: boolean;
};

/** Static branded artwork served from /public — not an upload URL. */
export function KfListingNoPhotoPlaceholder({ displayName, className, priority }: Props) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LISTING_NO_PHOTO_PLACEHOLDER_PATH}
      alt={listingNoPhotoAlt(displayName)}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}