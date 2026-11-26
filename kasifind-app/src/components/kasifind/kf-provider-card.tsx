"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Building2, MapPin } from "lucide-react";
import { KfListingRatingDisplay } from "@/components/kasifind/kf-listing-rating-display";
import type { KfSearchResult } from "@/components/kasifind/types";
import { KfProviderCardGallery } from "@/components/kasifind/kf-provider-card-gallery";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { collectListingCardPhotoUrls } from "@/lib/kasifind/listing-card-photos";
import { hasValidDistanceKm } from "@/components/kasifind/format-distance";
import { KfCrowFliesDistance } from "@/components/kasifind/kf-crow-flies-distance";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";
import { useKfListingImpression } from "@/components/kasifind/use-kf-listing-impression";
import { KfListingContactFooter } from "@/components/kasifind/kf-listing-contact-footer";
import { pickDirectionsUrl } from "@/lib/kasifind/navigation-urls";
import { saveDiscoveryScroll } from "@/lib/kasifind/discovery-scroll";

type Props = {
  provider: KfSearchResult;
  serviceHint: string;
  index?: number;
  impressionScopeKey?: string | null;
  contactCtaLabel?: string;
  preserveDiscoveryScroll?: boolean;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

function hasNavCoordinates(map: KfSearchResult["map"]): boolean {
  return Number.isFinite(map.latitude) && Number.isFinite(map.longitude);
}

export function KfProviderCard({
  provider: p,
  serviceHint,
  index = 0,
  impressionScopeKey = null,
  contactCtaLabel,
  preserveDiscoveryScroll = false,
}: Props) {
  const impressionRef = useKfListingImpression(p.id, impressionScopeKey);
  const waPhone = (p.whatsapp || p.phone || "").trim();
  const callPhone = (p.phone || "").trim();
  const canWhatsApp = phoneDigits(waPhone).length >= 9;
  const canCall = phoneDigits(callPhone).length >= 9;
  const waUrl = canWhatsApp
    ? buildWhatsAppUrl(waPhone, defaultEnquiryMessage(p.displayName, serviceHint))
    : null;
  const directionsUrl = useMemo(() => {
    if (!hasNavCoordinates(p.map)) return null;
    const ua = typeof navigator !== "undefined" ? navigator.userAgent : undefined;
    return pickDirectionsUrl(p.map.latitude, p.map.longitude, p.locationLabel, ua);
  }, [p.map, p.locationLabel]);
  const cardPhotos = useMemo(
    () => collectListingCardPhotoUrls({ photoUrls: p.photoUrls, profileImageUrl: p.profileImageUrl }),
    [p.photoUrls, p.profileImageUrl]
  );
  const servicesPreview = p.services.slice(0, 3).map((s) => s.name).join(" · ");
  const descriptionPreview = p.description.trim();
  const bodyPreview = descriptionPreview || servicesPreview;
  const primaryCategory = p.categories[0]?.name;
  const hasRating = p.reviewCount > 0 && p.averageRating !== null;
  const showDistance = hasValidDistanceKm(p.distanceKm);
  const profileSrc = p.profileImageUrl?.trim() || cardPhotos[0] || null;
  const profileMatchesGalleryCover =
    Boolean(profileSrc) && cardPhotos.length > 0 && profileSrc === cardPhotos[0];
  const hasListingMedia = cardPhotos.length > 0;

  return (
    <li
      ref={impressionRef}
      data-kf-listing-id={p.id}
      className="kf-card kf-card-interactive kf-glow-border kf-provider-card overflow-hidden"
    >
      <Link
        href={`/providers/${p.id}`}
        className="block group"
        scroll={false}
        onPointerDown={(e) => {
          if (!preserveDiscoveryScroll || e.button !== 0) return;
          saveDiscoveryScroll(p.id);
        }}
      >
        <div
          className={`kf-provider-media kf-provider-media--cover${hasListingMedia ? "" : " kf-provider-media--empty"}`}
        >
          <KfProviderCardGallery
            photos={cardPhotos}
            displayName={p.displayName}
            categoryName={primaryCategory}
            priority={index < 4}
          />
          {showDistance ? <KfCrowFliesDistance km={p.distanceKm} variant="badge" /> : null}
        </div>

        <div
          className={`kf-provider-card-body-wrap${hasListingMedia ? "" : " kf-provider-card-body-wrap--no-media"}`}
        >
          {hasListingMedia ? (
            <div
              className={`kf-provider-card-avatar${profileSrc ? "" : " kf-provider-card-avatar--placeholder"}`}
              aria-hidden
            >
              {profileSrc ? (
                <KfListingImage
                  src={profileSrc}
                  alt=""
                  className="kf-provider-card-avatar-img"
                  priority={index < 4 && !profileMatchesGalleryCover}
                />
              ) : (
                <Building2 className="h-6 w-6 text-[var(--kf-muted)]" />
              )}
            </div>
          ) : null}

          <div
            className="kf-provider-card-body kf-animate-in"
            style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}
          >
            <h3 className="kf-provider-card-title group-hover:text-[var(--kf-forest)]">
              {p.displayName}
            </h3>
            {primaryCategory ? (
              <p className="kf-provider-card-category">{primaryCategory}</p>
            ) : null}
            {hasRating ? (
              <div className="kf-provider-card-rating">
                <KfListingRatingDisplay
                  averageRating={p.averageRating!}
                  reviewCount={p.reviewCount}
                  variant="card"
                />
              </div>
            ) : (
              <p className="kf-provider-card-unrated">No reviews yet</p>
            )}
            <p className="kf-provider-card-location">
              <MapPin className="kf-provider-card-location-icon" aria-hidden />
              <span>{p.locationLabel}</span>
            </p>
            {bodyPreview ? (
              <p className="kf-provider-card-description">{bodyPreview}</p>
            ) : null}
          </div>
        </div>
      </Link>
      <KfListingContactFooter
        listingId={p.id}
        displayName={p.displayName}
        waUrl={waUrl}
        callPhone={callPhone}
        directionsUrl={directionsUrl}
        contactCtaLabel={contactCtaLabel}
      />
    </li>
  );
}