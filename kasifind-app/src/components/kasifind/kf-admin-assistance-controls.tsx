"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { KfListingAssistanceStatus } from "@/generated/prisma/enums";
import {
  kfAdminSaveAssistanceNotes,
  kfAdminUpdateAssistanceStatus,
} from "@/lib/kasifind/listing-assistance-actions";

const STATUS_OPTIONS: { value: KfListingAssistanceStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
  { value: "DECLINED", label: "Declined" },
];

export function KfAdminAssistanceControls({
  requestId,
  status,
  adminNotes: initialNotes,
}: {
  requestId: string;
  status: KfListingAssistanceStatus;
  adminNotes: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [statusNote, setStatusNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const saveNotes = () => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("requestId", requestId);
      fd.set("adminNotes", notes);
      const result = await kfAdminSaveAssistanceNotes(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  };

  const updateStatus = (toStatus: KfListingAssistanceStatus) => {
    setError(null);
    startTransition(async () => {
      const fd = new FormData();
      fd.set("requestId", requestId);
      fd.set("status", toStatus);
      if (statusNote.trim()) fd.set("note", statusNote.trim());
      const result = await kfAdminUpdateAssistanceStatus(fd);
      if ("error" in result && result.error) {
        setError(result.error);
        return;
      }
      setStatusNote("");
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <input type="hidden" name="requestId" value={requestId} />

      <div>
        <label className="text-sm font-semibold">Request status</label>
        <p className="mt-1 text-sm text-[var(--kf-muted)]">
          Current: <strong>{STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status}</strong>
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`kf-btn text-sm${opt.value === status ? " kf-btn-primary" : " kf-btn-outline"}`}
              disabled={pending || opt.value === status}
              onClick={() => updateStatus(opt.value)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <label className="kf-label mt-3 block text-sm">
          Note with status change <span className="font-normal">(optional, internal)</span>
          <input
            className="kf-input mt-1 w-full"
            value={statusNote}
            onChange={(e) => setStatusNote(e.target.value)}
            maxLength={2000}
            placeholder="Visible to admins only…"
          />
        </label>
      </div>

      <div>
        <label className="kf-label block text-sm">
          Internal notes
          <textarea
            className="kf-input mt-1 min-h-[5rem] w-full"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            maxLength={5000}
            placeholder="Private notes for the admin team…"
          />
        </label>
        <button type="button" className="kf-btn kf-btn-outline mt-2 text-sm" disabled={pending} onClick={saveNotes}>
          Save notes
        </button>
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
