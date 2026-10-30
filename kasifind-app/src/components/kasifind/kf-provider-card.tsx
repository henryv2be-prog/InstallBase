"use client";

import Link from "next/link";
import { ChevronRight, MessageCircle, Phone } from "lucide-react";
import {
  KfListingRatingDisplay,
  KfProviderRatingFloat,
} from "@/components/kasifind/kf-listing-rating-display";
import type { KfSearchResult } from "@/components/kasifind/types";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { formatDistanceKmClient } from "@/components/kasifind/format-distance";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";

type Props = {
  provider: KfSearchResult;
  serviceHint: string;
  index?: number;
};

function phoneDigits(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function KfProviderCard({ provider: p, serviceHint, index = 0 }: Props) {
  const waPhone = (p.whatsapp || p.phone || "").trim();
  const callPhone = (p.phone || "").trim();
  const canWhatsApp = phoneDigits(waPhone).length >= 9;
  const canCall = phoneDigits(callPhone).length >= 9;
  const waUrl = canWhatsApp
    ? buildWhatsAppUrl(waPhone, defaultEnquiryMessage(p.displayName, serviceHint))
    : null;
  const thumb = p.photoUrls[0] ?? p.profileImageUrl;
  const servicesPreview = p.services.slice(0, 3).map((s) => s.name).join(" · ");
  const primaryCategory = p.categories[0]?.name;
  const hasRating = p.reviewCount > 0 && p.averageRating !== null;

  return (
    <li className="kf-card kf-card-interactive kf-glow-border kf-provider-card overflow-hidden">
      <Link href={`/providers/${p.id}`} className="block group">
        <div className="kf-provider-media">
          {thumb ? (
            <KfListingImage
              src={thumb}
              alt=""
              className="kf-provider-thumb transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          ) : (
            <div className="kf-provider-thumb-placeholder">
              <span className="font-semibold text-[var(--kf-muted)]">No photo yet</span>
            </div>
          )}
          {primaryCategory ? (
            <span className="kf-provider-category-badge">{primaryCategory}</span>
          ) : null}
          {hasRating ? (
            <KfProviderRatingFloat
              averageRating={p.averageRating!}
              reviewCount={p.reviewCount}
            />
          ) : null}
          <span className="kf-provider-view-hint">
            View profile
            <ChevronRight className="h-3 w-3" aria-hidden />
          </span>
        </div>
        <div className="kf-animate-in p-4" style={{ animationDelay: `${Math.min(index, 8) * 40}ms` }}>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base font-bold leading-tight text-[var(--kf-charcoal)] group-hover:text-[var(--kf-forest)]">
              {p.displayName}
            </h3>
            <span className="kf-distance-badge" title="Distance from your search area">
              {formatDistanceKmClient(p.distanceKm)}
            </span>
          </div>
          {hasRating ? (
            <div className="mt-2">
              <KfListingRatingDisplay
                averageRating={p.averageRating!}
                reviewCount={p.reviewCount}
                variant="card"
              />
            </div>
          ) : (
            <p className="kf-rating-unrated mt-2">No reviews yet</p>
          )}
          <p className="mt-1.5 line-clamp-1 text-xs text-[var(--kf-muted)]">{p.locationLabel}</p>
          {servicesPreview ? (
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-[var(--kf-text)]">
              {servicesPreview}
            </p>
          ) : null}
        </div>
      </Link>
      {(canWhatsApp || canCall) && (
        <div
          className={`kf-provider-contact-row${canWhatsApp && canCall ? "" : " kf-provider-contact-row--single"}`}
        >
          {canWhatsApp && waUrl ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="kf-btn kf-btn-wa min-h-[2.75rem] rounded-none text-sm"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              WhatsApp
            </a>
          ) : null}
          {canCall ? (
            <a
              href={`tel:${callPhone.replace(/\s/g, "")}`}
              className="kf-btn kf-btn-secondary min-h-[2.75rem] rounded-none text-sm text-[var(--kf-forest)]"
            >
              <Phone className="h-4 w-4" aria-hidden />
              Call
            </a>
          ) : null}
        </div>
      )}
    </li>
  );
}
