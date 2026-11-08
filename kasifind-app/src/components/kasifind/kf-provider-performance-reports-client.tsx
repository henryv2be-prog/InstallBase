"use client";

import { useCallback, useRef, useState } from "react";
import { Download, ImageIcon, Loader2, Search } from "lucide-react";
import { KfProviderPerformanceReportArtboard } from "@/components/kasifind/kf-provider-performance-report-artboard";
import { downloadProviderPerformanceReportPng } from "@/lib/kasifind/export-provider-performance-report-png";
import type { ProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-report-types";
import type { ProviderReportPeriodPreset } from "@/lib/kasifind/provider-performance-report-period";
import { kfDateKeyInSast } from "@/lib/kasifind/format-datetime";

type ListingHit = {
  id: string;
  displayName: string;
  status: string;
  moderationStatus: string;
};

export function KfProviderPerformanceReportsClient() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const todayKey = kfDateKeyInSast(new Date());

  const [search, setSearch] = useState("");
  const [searching, setSearching] = useState(false);
  const [hits, setHits] = useState<ListingHit[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [period, setPeriod] = useState<ProviderReportPeriodPreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState(todayKey);

  const [metrics, setMetrics] = useState<ProviderPerformanceReportMetrics | null>(null);
  const [generatedAtLabel, setGeneratedAtLabel] = useState<string>("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runSearch = useCallback(async () => {
    const q = search.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/listings/search?q=${encodeURIComponent(q)}`);
      const data = (await res.json()) as { listings?: ListingHit[]; error?: string };
      if (!res.ok) throw new Error(data.error ?? "search_failed");
      setHits(data.listings ?? []);
    } catch {
      setError("Could not search listings.");
      setHits([]);
    } finally {
      setSearching(false);
    }
  }, [search]);

  const generateReport = useCallback(async () => {
    if (!selectedId) {
      setError("Select a listing first.");
      return;
    }
    if (period === "custom" && !customFrom.trim()) {
      setError("Choose a start date for the custom range.");
      return;
    }
    setLoadingReport(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        listingId: selectedId,
        period,
      });
      if (period === "custom") {
        params.set("from", customFrom.trim());
        params.set("to", customTo.trim() || todayKey);
      }
      const res = await fetch(`/api/admin/provider-performance-report?${params}`);
      const data = (await res.json()) as {
        metrics?: ProviderPerformanceReportMetrics;
        generatedAtLabel?: string;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "report_failed");
      setMetrics(data.metrics ?? null);
      setGeneratedAtLabel(data.generatedAtLabel ?? "");
    } catch (e) {
      setMetrics(null);
      setError(e instanceof Error ? e.message : "Could not generate report.");
    } finally {
      setLoadingReport(false);
    }
  }, [customFrom, customTo, period, selectedId, todayKey]);

  const downloadPng = useCallback(async () => {
    const node = artboardRef.current;
    if (!node || !metrics) return;
    setDownloading(true);
    setError(null);
    try {
      await downloadProviderPerformanceReportPng(node, metrics.businessName);
    } catch {
      setError("PNG export failed. Try generating the preview again.");
    } finally {
      setDownloading(false);
    }
  }, [metrics]);

  const selectedListing = hits.find((h) => h.id === selectedId);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="kf-admin-section-title">Provider Performance Reports</h2>
        <p className="mt-1 text-sm text-[var(--kf-muted)]">
          Search for a business, choose a period, preview the shareable image, then download a PNG for
          WhatsApp. Statistics come from KasiFind analytics — admin views do not add events.
        </p>
      </div>

      <section className="kf-card space-y-4 rounded-xl p-4">
        <h3 className="font-semibold text-[var(--kf-charcoal)]">1. Find a listing</h3>
        <div className="flex flex-wrap gap-2">
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Business name…"
            className="kf-input min-w-[16rem] flex-1"
            aria-label="Search by business name"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void runSearch();
              }
            }}
          />
          <button
            type="button"
            className="kf-btn kf-btn-primary"
            disabled={searching || search.trim().length < 2}
            onClick={() => void runSearch()}
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Search className="h-4 w-4" />}
            Search
          </button>
        </div>
        {hits.length > 0 ? (
          <ul className="space-y-2">
            {hits.map((row) => (
              <li key={row.id}>
                <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--kf-border)] p-3">
                  <input
                    type="radio"
                    name="listing"
                    checked={selectedId === row.id}
                    onChange={() => setSelectedId(row.id)}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">{row.displayName}</span>
                    <span className="block text-xs text-[var(--kf-muted)]">
                      {row.status} · {row.moderationStatus}
                    </span>
                  </span>
                </label>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-[var(--kf-muted)]">Results appear after you search.</p>
        )}
      </section>

      <section className="kf-card space-y-4 rounded-xl p-4">
        <h3 className="font-semibold text-[var(--kf-charcoal)]">2. Reporting period</h3>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ["7d", "Last 7 days"],
              ["30d", "Last 30 days"],
              ["all", "All time"],
              ["custom", "Custom range"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`kf-btn text-sm ${period === value ? "kf-btn-primary" : "kf-btn-outline"}`}
              onClick={() => setPeriod(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {period === "custom" ? (
          <div className="flex flex-wrap gap-3">
            <label className="text-sm">
              From
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="kf-input mt-1 block"
              />
            </label>
            <label className="text-sm">
              To
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="kf-input mt-1 block"
              />
            </label>
          </div>
        ) : null}
        <button
          type="button"
          className="kf-btn kf-btn-primary"
          disabled={!selectedId || loadingReport}
          onClick={() => void generateReport()}
        >
          {loadingReport ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <ImageIcon className="h-4 w-4" aria-hidden />
          )}
          Generate report
        </button>
        {selectedListing ? (
          <p className="text-xs text-[var(--kf-muted)]">
            Selected: <strong>{selectedListing.displayName}</strong>
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {metrics ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-semibold text-[var(--kf-charcoal)]">3. Preview & download</h3>
            <button
              type="button"
              className="kf-btn kf-btn-primary"
              disabled={downloading}
              onClick={() => void downloadPng()}
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              ) : (
                <Download className="h-4 w-4" aria-hidden />
              )}
              Download PNG
            </button>
          </div>
          <ul className="list-disc space-y-1 pl-5 text-xs text-[var(--kf-muted)]">
            {metrics.trackingNotes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
          <div className="kf-ppr-preview-wrap">
            <KfProviderPerformanceReportArtboard
              ref={artboardRef}
              metrics={metrics}
              generatedAtLabel={generatedAtLabel}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
