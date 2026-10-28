"use client";

import Link from "next/link";
import { ChevronRight, MessageCircle, Phone, Star } from "lucide-react";
import type { KfSearchResult } from "@/components/kasifind/types";
import { KfListingImage } from "@/components/kasifind/kf-listing-image";
import { formatDistanceKmClient } from "@/components/kasifind/format-distance";
import { buildWhatsAppUrl, defaultEnquiryMessage } from "@/lib/kasifind/whatsapp";

type Props = {
  provider: KfSearchResult;
  serviceHint: string;
  index?: number;
};

export function KfProviderCard({ provider: p, serviceHint, index = 0 }: Props) {
  const waPhone = p.whatsapp || p.phone;
  const waUrl = buildWhatsAppUrl(waPhone, defaultEnquiryMessage(p.displayName, serviceHint));
  const thumb = p.photoUrls[0] ?? p.profileImageUrl;
  const servicesPreview = p.services.slice(0, 3).map((s) => s.name).join(" · ");

  return (
    <li className="kf-card kf-card-interactive overflow-hidden">
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
            <div className="kf-provider-thumb-placeholder">Work photo coming soon</div>
          )}
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
            <span className="shrink-0 rounded-full bg-[var(--kf-yellow-soft)] px-2 py-0.5 text-xs font-bold text-[var(--kf-forest)]">
              {formatDistanceKmClient(p.distanceKm)}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--kf-muted)]">{p.locationLabel}</p>
          {servicesPreview ? (
            <p className="mt-2 line-clamp-1 text-sm text-[var(--kf-text)]">{servicesPreview}</p>
          ) : null}
          {p.reviewCount > 0 && p.averageRating !== null ? (
            <p className="mt-2 flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-0.5 rounded-full bg-[var(--kf-ochre-soft)] px-1.5 py-0.5 font-semibold text-[var(--kf-charcoal)]">
                <Star className="h-3.5 w-3.5 fill-[var(--kf-ochre)] text-[var(--kf-ochre)]" aria-hidden />
                {p.averageRating.toFixed(1)}
              </span>
              <span className="text-[var(--kf-muted)]">
                {p.reviewCount} community review{p.reviewCount === 1 ? "" : "s"}
              </span>
            </p>
          ) : (
            <p className="mt-2 text-xs text-[var(--kf-muted-soft)]">New on KasiFind — be first to review</p>
          )}
        </div>
      </Link>
      <div className="grid grid-cols-2 gap-px border-t border-[var(--kf-border)] bg-[var(--kf-border)]">
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="kf-btn kf-btn-wa min-h-[2.75rem] rounded-none text-sm"
        >
          <MessageCircle className="h-4 w-4" aria-hidden />
          WhatsApp
        </a>
        <a
          href={`tel:${p.phone.replace(/\s/g, "")}`}
          className="kf-btn kf-btn-secondary min-h-[2.75rem] rounded-none text-sm text-[var(--kf-forest)]"
        >
          <Phone className="h-4 w-4" aria-hidden />
          Call
        </a>
      </div>
    </li>
  );
}
