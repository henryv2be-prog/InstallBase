"use client";

import { forwardRef } from "react";
import { KfBrandLogo } from "@/components/kasifind/kf-brand-logo";
import type { ProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-report-types";
import {
  PROVIDER_REPORT_HEIGHT_PX,
  PROVIDER_REPORT_WIDTH_PX,
} from "@/lib/kasifind/export-provider-performance-report-png";
import { PROVIDER_REPORT_TIME_ZONE_LABEL } from "@/lib/kasifind/provider-performance-report-period";

type Props = {
  metrics: ProviderPerformanceReportMetrics;
  generatedAtLabel: string;
};

function formatStat(value: number): string {
  return value.toLocaleString("en-ZA");
}

function StarRating({ rating }: { rating: number | null }) {
  if (rating === null) {
    return <span className="kf-ppr-stars kf-ppr-stars--empty">No reviews yet</span>;
  }
  const full = Math.round(rating);
  return (
    <span className="kf-ppr-stars" aria-hidden>
      {"★".repeat(Math.min(5, Math.max(0, full)))}
      {"☆".repeat(Math.max(0, 5 - full))}
      <span className="kf-ppr-rating-num">{rating.toFixed(1)}</span>
    </span>
  );
}

export const KfProviderPerformanceReportArtboard = forwardRef<HTMLDivElement, Props>(
  function KfProviderPerformanceReportArtboard({ metrics, generatedAtLabel }, ref) {
    const cards = [
      { label: "Impressions", value: formatStat(metrics.impressions) },
      { label: "Profile views", value: formatStat(metrics.profileViews) },
      { label: "Contact clicks", value: formatStat(metrics.contactClicks) },
      { label: "Directions", value: formatStat(metrics.directionsClicks) },
    ] as const;

    return (
      <div
        ref={ref}
        className="kf-ppr-artboard"
        style={{ width: PROVIDER_REPORT_WIDTH_PX, height: PROVIDER_REPORT_HEIGHT_PX }}
        role="img"
        aria-label={`KasiFind performance report for ${metrics.businessName}`}
      >
        <header className="kf-ppr-header">
          <PprHeaderBrand />
          <p className="kf-ppr-kicker">YOUR BUSINESS ON KASIFIND</p>
          <h1 className="kf-ppr-business">{metrics.businessName}</h1>
          <p className="kf-ppr-period">{metrics.periodLabel}</p>
          <p className="kf-ppr-meta">
            {PROVIDER_REPORT_TIME_ZONE_LABEL} · Generated {generatedAtLabel}
          </p>
        </header>

        <div className="kf-ppr-stats-grid">
          {cards.map((card) => (
            <div key={card.label} className="kf-ppr-stat-card">
              <p className="kf-ppr-stat-label">{card.label}</p>
              <p className="kf-ppr-stat-value">{card.value}</p>
            </div>
          ))}
        </div>

        <section className="kf-ppr-feedback">
          <p className="kf-ppr-feedback-title">Customer feedback</p>
          <StarRating rating={metrics.averageRating} />
          <p className="kf-ppr-review-count">
            {metrics.reviewCount === 0
              ? "No public reviews yet"
              : `${metrics.reviewCount.toLocaleString("en-ZA")} review${
                  metrics.reviewCount === 1 ? "" : "s"
                }`}
          </p>
        </section>

        <footer className="kf-ppr-footer">
          <p className="kf-ppr-thanks">
            Thank you for being part of KasiFind! <span aria-hidden>💙</span>
          </p>
          <p className="kf-ppr-tagline">Every local business deserves to be found.</p>
          <p className="kf-ppr-site">kasifind.co.za</p>
        </footer>
      </div>
    );
  }
);

function PprHeaderBrand() {
  return (
    <div className="kf-ppr-brand-row">
      <KfBrandLogo className="kf-ppr-logo" />
      <span className="kf-ppr-wordmark">KasiFind</span>
    </div>
  );
}
