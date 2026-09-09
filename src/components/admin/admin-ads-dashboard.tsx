"use client";

import { useMemo, useState, useTransition } from "react";
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
  updateAdSettings,
  toggleInventoryPlacement,
} from "@/lib/advertising/admin-actions";
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

export function AdminAdsDashboard({ overview, list }: AdminAdsDashboardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPlacement, setFilterPlacement] = useState("");
  const [previewAd, setPreviewAd] = useState<ListData["advertisements"][0] | null>(null);

  const filteredAds = useMemo(() => {
    return list.advertisements.filter((ad) => {
      if (filterStatus && ad.status !== filterStatus) return false;
      if (filterPlacement && !ad.placements.includes(filterPlacement)) return false;
      return true;
    });
  }, [list.advertisements, filterStatus, filterPlacement]);

  const run = (fn: () => Promise<{ error?: string; success?: boolean }>) => {
    startTransition(async () => {
      const result = await fn();
      if (result.error) toast.error(result.error);
      else {
        toast.success("Saved");
        router.refresh();
      }
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
              run(() => upsertAdvertisement(new FormData(e.currentTarget)));
            }}
          >
            <h3 className="md:col-span-2 font-semibold">Create advertisement</h3>
            <select name="campaignId" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Campaign</option>
              {list.campaigns.map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.advertiser.name}</option>
              ))}
            </select>
            <select name="advertiserId" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              <option value="">Advertiser</option>
              {list.advertisers.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
            <Input name="title" placeholder="Title" required />
            <select name="type" required className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {AD_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
            <Input name="destinationUrl" placeholder="Destination URL" required />
            <Input name="mediaUrl" placeholder="Media URL (optional)" />
            <Input name="ctaText" placeholder="CTA text" />
            <Input name="placements" placeholder="Placements (comma-separated keys)" defaultValue="feed_between_posts" />
            <select name="status" className="rounded-lg border border-border bg-background px-3 py-2 text-sm">
              {AD_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="isInternalLink" value="true" />
              Internal link
            </label>
            <Textarea name="description" placeholder="Description" className="md:col-span-2" rows={2} />
            <Textarea name="targetingRules" placeholder='Targeting JSON e.g. {"trades":["CCTV"],"countries":["South Africa"]}' className="md:col-span-2 font-mono text-xs" rows={2} />
            <div className="md:col-span-2">
              <Button type="submit" disabled={pending}>Create advertisement</Button>
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
