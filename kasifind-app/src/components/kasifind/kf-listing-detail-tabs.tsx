"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { MessageSquare, Star } from "lucide-react";
import { KfEmptyState } from "@/components/kasifind/kf-empty-state";
import { KfReviewForm } from "@/components/kasifind/kf-review-form";
import { KfWorkPhotoGallery } from "@/components/kasifind/kf-work-photo-gallery";

export type KfListingDetailTab = "about" | "services" | "photos" | "reviews";

type ReviewRow = {
  id: string;
  rating: number;
  body: string;
  authorName: string | null;
};

type PhotoRow = {
  src: string;
  alt: string;
};

type Props = {
  listingId: string;
  ownerPreview: boolean;
  description: string;
  categories: { slug: string; name: string }[];
  services: { name: string }[];
  photos: PhotoRow[];
  reviews: ReviewRow[];
};

const TAB_DEFS: { id: KfListingDetailTab; label: string }[] = [
  { id: "about", label: "About" },
  { id: "services", label: "Services" },
  { id: "photos", label: "Photos" },
  { id: "reviews", label: "Reviews" },
];

function tabFromHash(hash: string): KfListingDetailTab | null {
  if (hash === "#kf-listing-reviews" || hash === "#reviews") return "reviews";
  if (hash === "#kf-listing-photos" || hash === "#photos") return "photos";
  if (hash === "#kf-listing-services" || hash === "#services") return "services";
  if (hash === "#kf-listing-about" || hash === "#about") return "about";
  return null;
}

function hashForTab(tab: KfListingDetailTab): string {
  switch (tab) {
    case "reviews":
      return "#kf-listing-reviews";
    case "photos":
      return "#kf-listing-photos";
    case "services":
      return "#kf-listing-services";
    default:
      return "#kf-listing-about";
  }
}

export function KfListingDetailTabs({
  listingId,
  ownerPreview,
  description,
  categories,
  services,
  photos,
  reviews,
}: Props) {
  const baseId = useId();
  const [activeTab, setActiveTab] = useState<KfListingDetailTab>("about");

  useEffect(() => {
    const fromHash = tabFromHash(window.location.hash);
    if (fromHash) setActiveTab(fromHash);
    const onHash = () => {
      const next = tabFromHash(window.location.hash);
      if (next) setActiveTab(next);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  const selectTab = useCallback((tab: KfListingDetailTab) => {
    setActiveTab(tab);
    const hash = hashForTab(tab);
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
  }, []);

  const counts: Record<KfListingDetailTab, number | null> = {
    about: null,
    services: services.length > 0 ? services.length : null,
    photos: photos.length > 0 ? photos.length : null,
    reviews: reviews.length > 0 ? reviews.length : null,
  };

  return (
    <section className="kf-card mt-8 overflow-hidden kf-animate-in" aria-labelledby={`${baseId}-heading`}>
      <h2 id={`${baseId}-heading`} className="sr-only">
        Business details
      </h2>
      <div className="kf-listing-tabs" data-active-tab={activeTab}>
        <div
          className="kf-listing-tabs-scroll"
          role="tablist"
          aria-label="Listing sections"
        >
          {TAB_DEFS.map((tab) => {
            const selected = activeTab === tab.id;
            const count = counts[tab.id];
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`${baseId}-tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`${baseId}-panel-${tab.id}`}
                tabIndex={selected ? 0 : -1}
                className={`kf-listing-tab${selected ? " kf-listing-tab--active" : ""}`}
                onClick={() => selectTab(tab.id)}
              >
                <span>{tab.label}</span>
                {count !== null ? (
                  <span className="kf-listing-tab-count" aria-hidden>
                    {count}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <div
          id="kf-listing-about"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-about`}
          hidden={activeTab !== "about"}
          className="kf-listing-tab-panel"
        >
          {categories.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <span key={c.slug} className="kf-chip">
                  {c.name}
                </span>
              ))}
            </div>
          ) : null}
          <p
            className={`whitespace-pre-wrap leading-relaxed text-[var(--kf-text)]${
              categories.length > 0 ? " mt-4" : ""
            }`}
          >
            {description.trim() || "This business has not added a description yet."}
          </p>
        </div>

        <div
          id="kf-listing-services"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-services`}
          hidden={activeTab !== "services"}
          className="kf-listing-tab-panel"
        >
          {services.length > 0 ? (
            <ul className="kf-listing-service-list">
              {services.map((s) => (
                <li key={s.name} className="kf-listing-service-item">
                  {s.name}
                </li>
              ))}
            </ul>
          ) : (
            <KfEmptyState
              title="No services listed yet"
              description="Message this provider to ask what they offer — many local businesses list services after their first enquiries."
            />
          )}
        </div>

        <div
          id="kf-listing-photos"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-photos`}
          hidden={activeTab !== "photos"}
          className="kf-listing-tab-panel"
        >
          <p className="kf-section-sub">
            Tap a photo to enlarge{photos.length > 1 ? " and swipe between shots" : ""}.
          </p>
          {photos.length > 0 ? (
            <KfWorkPhotoGallery
              className="mt-4"
              priorityFirst
              photos={photos}
            />
          ) : (
            <div className="mt-4">
              <KfEmptyState
                title="No work photos yet"
                description="This provider has not uploaded gallery photos. You can still message them to ask for examples of past jobs."
              />
            </div>
          )}
        </div>

        <div
          id="kf-listing-reviews"
          role="tabpanel"
          aria-labelledby={`${baseId}-tab-reviews`}
          hidden={activeTab !== "reviews"}
          className="kf-listing-tab-panel"
        >
          <p className="text-xs text-[var(--kf-muted)]">
            KasiFind is growing — honest reviews from real customers help build trust over time.
          </p>
          <ul className="mt-4 space-y-4">
            {reviews.length === 0 ? (
              <li>
                <KfEmptyState
                  icon={<MessageSquare className="h-6 w-6" aria-hidden />}
                  title="Be the first to review"
                  description="Used this provider? Your experience helps others in the community. There is no pressure — only share if you have genuinely worked with them."
                />
              </li>
            ) : (
              reviews.map((r) => (
                <li key={r.id} className="border-t border-[var(--kf-border)] pt-4 first:border-0 first:pt-0">
                  <p className="flex items-center gap-1 text-sm font-semibold">
                    <Star className="h-3.5 w-3.5 fill-[var(--kf-ochre)] text-[var(--kf-ochre)]" aria-hidden />
                    {r.rating}/5 · {r.authorName ?? "Community member"}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--kf-text)]">{r.body}</p>
                </li>
              ))
            )}
          </ul>
          {ownerPreview ? (
            <p className="mt-4 text-sm text-[var(--kf-muted)]">
              Reviews open once your listing is live for everyone.
            </p>
          ) : (
            <KfReviewForm listingId={listingId} />
          )}
        </div>
      </div>
    </section>
  );
}