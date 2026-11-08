"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Download, ImageIcon, Loader2, MessageCircle } from "lucide-react";
import { KfProviderPerformanceReportArtboard } from "@/components/kasifind/kf-provider-performance-report-artboard";
import { downloadProviderPerformanceReportPng } from "@/lib/kasifind/export-provider-performance-report-png";
import type { ProviderPerformanceReportMetrics } from "@/lib/kasifind/provider-performance-report-types";
import type { ProviderReportPeriodPreset } from "@/lib/kasifind/provider-performance-report-period";
import { kfDateKeyInSast } from "@/lib/kasifind/format-datetime";
import type { ProviderReportListingRow } from "@/lib/kasifind/provider-performance-report-types";
import { resolveListingWhatsAppPhone } from "@/lib/kasifind/provider-performance-report-whatsapp";
import { shareProviderPerformanceReportWhatsApp } from "@/lib/kasifind/share-provider-performance-report-whatsapp";

export function KfProviderPerformanceReportsClient() {
  const artboardRef = useRef<HTMLDivElement>(null);
  const todayKey = kfDateKeyInSast(new Date());

  const [filter, setFilter] = useState("");
  const [listLoading, setListLoading] = useState(true);
  const [rows, setRows] = useState<ProviderReportListingRow[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize, setPageSize] = useState(30);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [period, setPeriod] = useState<ProviderReportPeriodPreset>("30d");
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState(todayKey);

  const [metrics, setMetrics] = useState<ProviderPerformanceReportMetrics | null>(null);
  const [whatsAppPhone, setWhatsAppPhone] = useState<string | null>(null);
  const [generatedAtLabel, setGeneratedAtLabel] = useState<string>("");
  const [loadingReport, setLoadingReport] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
  const [shareNote, setShareNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadListings = useCallback(async (opts: { page: number; q: string }) => {
    setListLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: String(opts.page) });
      if (opts.q.trim()) params.set("q", opts.q.trim());
      const res = await fetch(`/api/admin/provider-performance-listings?${params}`);
      const data = (await res.json()) as {
        rows?: ProviderReportListingRow[];
        total?: number;
        page?: number;
        pageSize?: number;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "list_failed");
      setRows(data.rows ?? []);
      setTotal(data.total ?? 0);
      setPage(data.page ?? opts.page);
      setPageSize(data.pageSize ?? 30);
    } catch {
      setError("Could not load listings.");
      setRows([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadListings({ page: 1, q: filter });
    }, 280);
    return () => window.clearTimeout(timer);
  }, [filter, loadListings]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

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
    setShareNote(null);
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
        whatsAppPhone?: string | null;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "report_failed");
      setMetrics(data.metrics ?? null);
      setWhatsAppPhone(data.whatsAppPhone ?? null);
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

  const selectedListing = rows.find((h) => h.id === selectedId);
  const effectiveWhatsAppPhone =
    whatsAppPhone ??
    (selectedListing ? resolveListingWhatsAppPhone(selectedListing) : null);

  const sendWhatsApp = useCallback(async () => {
    const node = artboardRef.current;
    if (!node || !metrics) return;
    const listing = rows.find((h) => h.id === selectedId);
    const phone = whatsAppPhone ?? (listing ? resolveListingWhatsAppPhone(listing) : null);
    setSharingWhatsApp(true);
    setError(null);
    setShareNote(null);
    try {
      const result = await shareProviderPerformanceReportWhatsApp({
        node,
        businessName: metrics.businessName,
        periodLabel: metrics.periodLabel,
        whatsAppPhone: phone,
      });
      if (result.mode === "no_phone") {
        setError(
          "This listing has no WhatsApp or phone number. Download the PNG and share it manually."
        );
      } else if (result.mode === "wa_listing") {
        setShareNote(
          `Opened WhatsApp to ${result.displayPhone} (from this listing). Attach the downloaded PNG in that chat.`
        );
      } else {
        setShareNote("Shared — choose WhatsApp and the provider in the share sheet.");
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      setError("Could not share via WhatsApp. Try downloading the PNG instead.");
    } finally {
      setSharingWhatsApp(false);
    }
  }, [metrics, rows, selectedId, whatsAppPhone]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="kf-admin-section-title">Provider Performance Reports</h2>
        <p className="mt-1 text-sm text-[var(--kf-muted)]">
          Pick a business from the list, generate the image, then download or share to the
          provider&apos;s WhatsApp number from their listing. The report image is downloaded for you
          to attach in that chat (WhatsApp Web cannot attach files automatically).
        </p>
      </div>

      <section className="kf-card space-y-4 rounded-xl p-4">
        <h3 className="font-semibold text-[var(--kf-charcoal)]">1. Choose a listing</h3>
        <input
          type="search"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter by name…"
          className="kf-input w-full max-w-md"
          aria-label="Filter listings by name"
        />
        {listLoading ? (
          <p className="flex items-center gap-2 text-sm text-[var(--kf-muted)]">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            Loading listings…
          </p>
        ) : (
          <>
            <p className="text-xs text-[var(--kf-muted)]">
              {total.toLocaleString("en-ZA")} listing{total === 1 ? "" : "s"}
              {filter.trim() ? ` matching “${filter.trim()}”` : ""}
            </p>
            <ul className="kf-ppr-listing-scroll max-h-[22rem] space-y-2 overflow-y-auto pr-1">
              {rows.length === 0 ? (
                <li className="text-sm text-[var(--kf-muted)]">No listings found.</li>
              ) : (
                rows.map((row) => (
                  <li key={row.id}>
                    <label className="flex cursor-pointer items-start gap-2 rounded-lg border border-[var(--kf-border)] p-3 hover:border-[var(--kf-forest)]">
                      <input
                        type="radio"
                        name="listing"
                        checked={selectedId === row.id}
                        onChange={() => setSelectedId(row.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="font-medium">{row.displayName}</span>
                        <span className="block text-xs text-[var(--kf-muted)]">
                          {row.status} · {row.moderationStatus}
                          {row.whatsapp || row.phone
                            ? ` · WhatsApp ${(row.whatsapp || row.phone).trim()}`
                            : " · No WhatsApp number"}
                        </span>
                      </span>
                    </label>
                  </li>
                ))
              )}
            </ul>
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  className="kf-btn kf-btn-outline text-sm"
                  disabled={page <= 1 || listLoading}
                  onClick={() => void loadListings({ page: page - 1, q: filter })}
                >
                  Previous
                </button>
                <span className="text-sm text-[var(--kf-muted)]">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  className="kf-btn kf-btn-outline text-sm"
                  disabled={page >= totalPages || listLoading}
                  onClick={() => void loadListings({ page: page + 1, q: filter })}
                >
                  Next
                </button>
              </div>
            ) : null}
          </>
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
            {resolveListingWhatsAppPhone(selectedListing) ? (
              <>
                {" "}
                · WhatsApp send-to:{" "}
                <strong>{resolveListingWhatsAppPhone(selectedListing)}</strong>
              </>
            ) : (
              <> · No WhatsApp/phone on listing</>
            )}
          </p>
        ) : null}
      </section>

      {error ? (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {error}
        </p>
      ) : null}

      {shareNote ? (
        <p className="rounded-lg bg-[var(--kf-forest-soft)] px-3 py-2 text-sm text-[var(--kf-forest)]">
          {shareNote}
        </p>
      ) : null}

      {metrics ? (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div>
              <h3 className="font-semibold text-[var(--kf-charcoal)]">3. Preview & send</h3>
              {effectiveWhatsAppPhone ? (
                <p className="text-xs text-[var(--kf-muted)]">
                  Will open WhatsApp to <strong>{effectiveWhatsAppPhone}</strong>
                </p>
              ) : null}
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <button
                type="button"
                className="kf-btn kf-btn-primary"
                disabled={sharingWhatsApp}
                onClick={() => void sendWhatsApp()}
              >
                {sharingWhatsApp ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <MessageCircle className="h-4 w-4" aria-hidden />
                )}
                Send via WhatsApp
              </button>
              <button
                type="button"
                className="kf-btn kf-btn-outline"
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
