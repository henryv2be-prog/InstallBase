"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { formatNumber } from "@/lib/utils";
import { PLACEMENT_LABELS, ALL_PLACEMENT_KEYS } from "@/lib/advertising/placements";
import {
  upsertAdvertiser,
  upsertCampaign,
  upsertAdvertisement,
  updateAdStatus,
  updateCampaignStatus,
  duplicateAdvertisement,
  deleteAdvertisement,
  updateAdSettings,
  toggleInventoryPlacement,
} from "@/lib/advertising/admin-actions";
import type { AdvertisementFormField } from "@/lib/advertising/admin-validation";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AdRenderer } from "@/components/ads/ad-renderer";
import type { AdCreative } from "@/lib/advertising/types";

type Overview = Awaited<ReturnType<typeof import("@/lib/advertising/queries").getAdAdminOverview>>;
type ListData = Awaited<ReturnType<typeof import("@/lib/advertising/queries").getAdAdminList>>;

interface AdminAdsDashboardProps {
  overview: Overview;
  list: ListData;
}

const AD_TYPES = ["IMAGE", "BANNER", "SPONSORED_POST", "SPONSORED_PRODUCT", "SPONSORED_ARTICLE", "VIDEO"];
const AD_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED"];
const CAMPAIGN_STATUSES = ["DRAFT", "ACTIVE", "PAUSED", "ARCHIVED", "COMPLETED"];
const PRICING_MODELS = ["CPM", "CPC", "FLAT_RATE", "MONTHLY", "PACKAGE"];

function toPreviewCreative(ad: ListData["advertisements"][0]): AdCreative {
  return {
    id: ad.id,
    campaignId: ad.campaignId,
    advertiserId: ad.advertiserId,
    advertiserName: ad.advertiser.name,
    advertiserLogoUrl: ad.advertiser.logoUrl,
    title: ad.title,
    description: ad.description,
    type: ad.type,
    placements: ad.placements,
    mediaUrl: ad.mediaUrl,
    mediaType: ad.mediaType,
    destinationUrl: ad.destinationUrl,
    ctaText: ad.ctaText,
    isInternalLink: ad.isInternalLink,
    sponsoredProductId: ad.sponsoredProductId,
    sponsoredPostId: ad.sponsoredPostId,
    priority: ad.priority,
    label: "Sponsored",
  };
}

function FormField({
  label,
  error,
  hint,
  children,
  className,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
}

const DEFAULT_PLACEMENTS = ["feed_between_posts", "feed_top"];

export function AdminAdsDashboard({ overview, list }: AdminAdsDashboardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlacement, setFilterPlacement] = useState("");
  const [previewAd, setPreviewAd] = useState<ListData["advertisements"][0] | null>(null);
  const [adFormErrors, setAdFormErrors] = useState<Partial<Record<AdvertisementFormField, string>>>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState("");
  const [selectedAdvertiserId, setSelectedAdvertiserId] = useState("");
  const [selectedPlacements, setSelectedPlacements] = useState<string[]>(DEFAULT_PLACEMENTS);

  const filteredAds = useMemo(() => {
    return list.advertisements.filter((ad) => {
      if (filterStatus && ad.status !== filterStatus) return false;
      if (filterPlacement && !ad.placements.includes(filterPlacement)) return false;
      return true;
    });
  }, [list.advertisements, filterStatus, filterPlacement]);

  const run = (
    fn: () => Promise<{ error?: string; success?: boolean; fields?: Partial<Record<AdvertisementFormField, string>> }>,
    options?: { clearAdErrors?: boolean }
  ) => {
    startTransition(async () => {
      const result = await fn();
      if (result.error) {
        toast.error(result.error);
        if (result.fields) setAdFormErrors(result.fields);
      } else {
        if (options?.clearAdErrors) {
          setAdFormErrors({});
          setSelectedCampaignId("");
          setSelectedAdvertiserId("");
          setSelectedPlacements(DEFAULT_PLACEMENTS);
        }
        toast.success("Saved");
        router.refresh();
      }
    });
  };

  const onCampaignChange = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    const campaign = list.campaigns.find((item) => item.id === campaignId);
    if (campaign) setSelectedAdvertiserId(campaign.advertiserId);
    setAdFormErrors((prev) => {
      const next = { ...prev };
      delete next.campaignId;
      delete next.advertiserId;
      return next;
    });
  };

  const togglePlacement = (placement: string) => {
    setSelectedPlacements((prev) => {
      const next = prev.includes(placement)
        ? prev.filter((item) => item !== placement)
        : [...prev, placement];
      return next.length ? next : prev;
    });
    setAdFormErrors((prev) => {
      const next = { ...prev };
      delete next.placements;
      return next;
    });
  };

  const settings = list.settings;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Advertising</h1>
          <p className="text-sm text-muted">Manage campaigns, creatives, inventory and settings</p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">← Admin home</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Active campaigns", value: overview.activeCampaigns },
          { label: "Total impressions", value: overview.totalImpressions },
          { label: "Total clicks", value: overview.totalClicks },
          { label: "Average CTR", value: `${overview.avgCtr.toFixed(2)}%` },
          { label: "Active advertisers", value: overview.advertisers },
          { label: "Revenue-ready", value: overview.revenueReady },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border bg-card p-4">
            <p className="text-xs text-muted">{stat.label}</p>
            <p className="mt-1 text-2xl font-bold">
              {typeof stat.value === "number" ? formatNumber(stat.value) : stat.value}
            </p>
          </div>
        ))}
      </div>

      <Tabs defaultValue="ads">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="ads">Advertisements</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="advertisers">Advertisers</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <select className="rounded-lg border border-border bg-card px-3 py-2 text-sm" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
              <option value="">All statuses</option>
              {AD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="rounded-lg border border-border bg-card px-3 py-2 text-sm" value={filterPlacement} onChange={(e) => setFilterPlacement(e.target.value)}>
              <option value="">All placements</option>
              {ALL_PLACEMENT_KEYS.map((p) => <option key={p} value={p}>{PLACEMENT_LABELS[p]}</option>)}
            </select>
          </div>

          <form
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => upsertAdvertisement(new FormData(e.currentTarget)), { clearAdErrors: true });
            }}
          >
            <h3 className="md:col-span-2 font-semibold">Create advertisement</h3>
            {list.campaigns.length === 0 && (
              <p className="md:col-span-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-200">
                Create an advertiser and campaign first, then you can add an advertisement.
              </p>
            )}
            <FormField label="Campaign *" error={adFormErrors.campaignId}>
              <select
                name="campaignId"
                value={selectedCampaignId}
                onChange={(event) => onCampaignChange(event.target.value)}
                className={cn(
                  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                  adFormErrors.campaignId && "border-red-500"
                )}
              >
                <option value="">Select campaign…</option>
                {list.campaigns.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} — {c.advertiser.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Advertiser *" error={adFormErrors.advertiserId} hint="Auto-filled from the campaign you pick">
              <select
                name="advertiserId"
                value={selectedAdvertiserId}
                onChange={(event) => setSelectedAdvertiserId(event.target.value)}
                className={cn(
                  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                  adFormErrors.advertiserId && "border-red-500"
                )}
              >
                <option value="">Select advertiser…</option>
                {list.advertisers.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title *" error={adFormErrors.title}>
              <Input
                name="title"
                placeholder="e.g. Professional CCTV for every install"
                className={adFormErrors.title ? "border-red-500" : undefined}
              />
            </FormField>
            <FormField label="Ad type *" error={adFormErrors.type}>
              <select
                name="type"
                className={cn(
                  "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm",
                  adFormErrors.type && "border-red-500"
                )}
              >
                {AD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </FormField>
            <FormField
              label="Destination URL *"
              error={adFormErrors.destinationUrl}
              hint="Use https://… for external sites, or /discover for in-app pages (paths starting with / work automatically)"
            >
              <Input
                name="destinationUrl"
                placeholder="https://example.com or /discover"
                className={adFormErrors.destinationUrl ? "border-red-500" : undefined}
              />
            </FormField>
            <FormField
              label="Media URL"
              error={adFormErrors.mediaUrl}
              hint="Optional. Use /ads/… or https://…"
            >
              <Input
                name="mediaUrl"
                placeholder="/ads/hikvision-demo.jpg"
                className={adFormErrors.mediaUrl ? "border-red-500" : undefined}
              />
            </FormField>
            <FormField label="CTA text" hint="Optional button label, e.g. Learn more">
              <Input name="ctaText" placeholder="Learn more" />
            </FormField>
            <FormField label="Status">
              <select name="status" className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm">
                {AD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </FormField>
            <label className="flex items-center gap-2 text-sm md:col-span-2">
              <input type="checkbox" name="isInternalLink" value="true" />
              Internal link (only needed if the URL does not start with /)
            </label>
            <FormField label="Placements *" error={adFormErrors.placements} className="md:col-span-2">
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {ALL_PLACEMENT_KEYS.map((placement) => (
                  <label
                    key={placement}
                    className="flex cursor-pointer items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      name="placementKeys"
                      value={placement}
                      checked={selectedPlacements.includes(placement)}
                      onChange={() => togglePlacement(placement)}
                    />
                    {PLACEMENT_LABELS[placement as keyof typeof PLACEMENT_LABELS] ?? placement}
                  </label>
                ))}
              </div>
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <Textarea name="description" placeholder="Short ad copy shown in the feed" rows={2} />
            </FormField>
            <FormField
              label="Targeting (optional)"
              hint='JSON e.g. {"trades":["CCTV"],"countries":["South Africa"]} — leave blank to show everyone'
              className="md:col-span-2"
            >
              <Textarea name="targetingRules" className="font-mono text-xs" rows={2} />
            </FormField>
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending || list.campaigns.length === 0}>
                Create advertisement
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {filteredAds.map((ad) => (
              <div key={ad.id} className="rounded-2xl border border-border bg-card p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{ad.title}</p>
                    <p className="text-sm text-muted">{ad.advertiser.name} · {ad.campaign.name}</p>
                    <p className="mt-1 text-xs text-muted">
                      {ad.type} · {ad.status} · {ad.placements.map((p) => PLACEMENT_LABELS[p as keyof typeof PLACEMENT_LABELS] ?? p).join(", ")}
                    </p>
                    <p className="mt-1 text-xs">
                      {formatNumber(ad.impressions)} impressions · {formatNumber(ad.clicks)} clicks · CTR {ad.impressions ? ((ad.clicks / ad.impressions) * 100).toFixed(2) : "0.00"}%
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => setPreviewAd(ad)}>Preview</Button>
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => duplicateAdvertisement(ad.id))}>Duplicate</Button>
                    {ad.status !== "ACTIVE" && (
                      <Button size="sm" disabled={pending} onClick={() => run(() => updateAdStatus(ad.id, "ACTIVE"))}>Activate</Button>
                    )}
                    {ad.status === "ACTIVE" && (
                      <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => updateAdStatus(ad.id, "PAUSED"))}>Pause</Button>
                    )}
                    {ad.status !== "ARCHIVED" && (
                      <Button size="sm" variant="ghost" disabled={pending} onClick={() => run(() => updateAdStatus(ad.id, "ARCHIVED"))}>Archive</Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-red-600 hover:text-red-700 dark:text-red-400"
                      disabled={pending}
                      onClick={() => {
                        if (!window.confirm(`Delete "${ad.title}"? This cannot be undone.`)) return;
                        run(() => deleteAdvertisement(ad.id));
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-4">
          <form
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => upsertCampaign(new FormData(e.currentTarget)));
            }}
          >
            <h3 className="md:col-span-2 font-semibold">Create campaign</h3>
            <select name="advertiserId" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Advertiser</option>
              {list.advertisers.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <Input name="name" placeholder="Campaign name" required />
            <select name="status" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {CAMPAIGN_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="pricingModel" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Pricing model</option>
              {PRICING_MODELS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <Input name="budget" type="number" step="0.01" placeholder="Budget" />
            <Input name="priority" type="number" placeholder="Priority" defaultValue="0" />
            <Input name="startDate" type="datetime-local" />
            <Input name="endDate" type="datetime-local" />
            <Textarea name="description" placeholder="Description" className="md:col-span-2" rows={2} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>Create campaign</Button>
            </div>
          </form>

          {list.campaigns.map((campaign) => (
            <div key={campaign.id} className="rounded-2xl border border-border bg-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{campaign.name}</p>
                  <p className="text-sm text-muted">{campaign.advertiser.name} · {campaign.status} · {campaign.advertisements.length} ads</p>
                </div>
                <div className="flex gap-2">
                  {campaign.status !== "ACTIVE" && (
                    <Button size="sm" disabled={pending} onClick={() => run(() => updateCampaignStatus(campaign.id, "ACTIVE"))}>Activate</Button>
                  )}
                  {campaign.status === "ACTIVE" && (
                    <Button size="sm" variant="outline" disabled={pending} onClick={() => run(() => updateCampaignStatus(campaign.id, "PAUSED"))}>Pause</Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="advertisers" className="space-y-4">
          <form
            className="grid gap-3 rounded-2xl border border-border bg-card p-4 md:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              run(() => upsertAdvertiser(new FormData(e.currentTarget)));
            }}
          >
            <h3 className="md:col-span-2 font-semibold">Create advertiser</h3>
            <Input name="name" placeholder="Company name" required className="md:col-span-2" />
            <Input name="website" placeholder="Website" />
            <Input name="contactEmail" placeholder="Contact email" />
            <Input name="companyType" placeholder="Company type (e.g. Manufacturer)" />
            <Input name="logoUrl" placeholder="Logo URL" />
            <Textarea name="description" placeholder="Description" className="md:col-span-2" rows={2} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>Create advertiser</Button>
            </div>
          </form>

          {list.advertisers.map((advertiser) => (
            <div key={advertiser.id} className="rounded-2xl border border-border bg-card p-4">
              <p className="font-semibold">{advertiser.name}</p>
              <p className="text-sm text-muted">{advertiser.companyType ?? "Advertiser"} · {advertiser.contactEmail ?? "No email"}</p>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-3">
          {overview.inventory.map((slot) => (
            <div key={slot.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4">
              <div>
                <p className="font-semibold">{slot.name}</p>
                <p className="text-sm text-muted">{slot.description}</p>
                <p className="mt-1 text-xs text-muted">
                  {slot.placementKey} · {slot.format} · {slot.deviceSupport}
                  {slot.width && slot.height ? ` · ${slot.width}×${slot.height}` : ""}
                </p>
              </div>
              <Button
                size="sm"
                variant={slot.enabled ? "outline" : "default"}
                disabled={pending}
                onClick={() => run(() => toggleInventoryPlacement(slot.placementKey, !slot.enabled))}
              >
                {slot.enabled ? "Disable" : "Enable"}
              </Button>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="settings">
          {settings && (
            <form
              className="grid max-w-xl gap-3 rounded-2xl border border-border bg-card p-4"
              onSubmit={(e) => {
                e.preventDefault();
                run(() => updateAdSettings(new FormData(e.currentTarget)));
              }}
            >
              <h3 className="font-semibold">Global advertising settings</h3>
              {[
                ["adsEnabled", settings.adsEnabled],
                ["sponsoredEnabled", settings.sponsoredEnabled],
                ["analyticsEnabled", settings.analyticsEnabled],
              ].map(([name, checked]) => (
                <label key={name as string} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name={name as string} value="true" defaultChecked={checked as boolean} />
                  {name as string}
                </label>
              ))}
              <Input name="maxFeedAds" type="number" defaultValue={settings.maxFeedAds} placeholder="Max feed ads" />
              <Input name="minPostsBetweenAds" type="number" defaultValue={settings.minPostsBetweenAds} placeholder="Min posts between ads" />
              <Input name="maxPageAds" type="number" defaultValue={settings.maxPageAds} placeholder="Max page ads" />
              <Input name="mobileMaxFeedAds" type="number" defaultValue={settings.mobileMaxFeedAds} />
              <Input name="desktopMaxFeedAds" type="number" defaultValue={settings.desktopMaxFeedAds} />
              <Input name="defaultPriority" type="number" defaultValue={settings.defaultPriority} />
              <Input name="provider" defaultValue={settings.provider} placeholder="Provider (internal)" />
              <Button type="submit" disabled={pending}>Save settings</Button>
            </form>
          )}
        </TabsContent>
      </Tabs>

      {previewAd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setPreviewAd(null)}>
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold">Ad preview</h3>
              <Button size="sm" variant="ghost" onClick={() => setPreviewAd(null)}>Close</Button>
            </div>
            <AdRenderer
              ad={toPreviewCreative(previewAd)}
              placementKey={previewAd.placements[0] ?? "feed_between_posts"}
            />
          </div>
        </div>
      )}
    </div>
  );
}
