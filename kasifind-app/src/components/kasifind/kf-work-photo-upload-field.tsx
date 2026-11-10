"use client";

import { type ReactNode, useCallback, useRef, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import {
  MAX_LISTING_WORK_PHOTOS,
  planWorkPhotoUploads,
} from "@/lib/kasifind/listing-photo-limits";
import { uploadListingImageFile } from "@/lib/kasifind/upload-file-client";
import { useKfToast } from "@/components/kasifind/kf-toast";

const MAX_CONCURRENT = 3;

export type WorkPhotoUploadJob = {
  id: string;
  fileName: string;
  progress: number;
  phase: "queued" | "uploading" | "saving" | "done" | "error";
  error?: string;
};

type AddPhotoResult = { success?: boolean; error?: string };

type Props = {
  existingPhotoCount: number;
  disabled?: boolean;
  assistanceRequestId?: string;
  addListingPhoto: (formData: FormData) => Promise<AddPhotoResult>;
  onPhotoAttached: () => void;
};

function shortFileName(name: string): string {
  const base = name.replace(/^.*[/\\]/, "");
  return base.length > 28 ? `${base.slice(0, 25)}…` : base;
}

export function KfWorkPhotoUploadField({
  existingPhotoCount,
  disabled,
  assistanceRequestId,
  addListingPhoto,
  onPhotoAttached,
}: Props) {
  const toast = useKfToast();
  const [jobs, setJobs] = useState<WorkPhotoUploadJob[]>([]);
  const inFlightRef = useRef(0);
  const queueRef = useRef<{ id: string; file: File }[]>([]);
  const processingRef = useRef(false);
  const pumpQueueRef = useRef<() => void>(() => undefined);

  const activeCount = jobs.filter((j) => j.phase !== "done" && j.phase !== "error").length;
  const reservedSlots = jobs.filter((j) => j.phase !== "error").length;
  const atPhotoLimit = existingPhotoCount + reservedSlots >= MAX_LISTING_WORK_PHOTOS;

  const patchJob = useCallback((id: string, patch: Partial<WorkPhotoUploadJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)));
  }, []);

  const runOne = useCallback(
    async (id: string, file: File) => {
      inFlightRef.current += 1;
      patchJob(id, { phase: "uploading", progress: 0 });
      try {
        const uploaded = await uploadListingImageFile(file, (progress) => {
          patchJob(id, { progress });
        });

        if ("error" in uploaded) {
          patchJob(id, { phase: "error", error: uploaded.error, progress: 0 });
          return;
        }

        patchJob(id, { phase: "saving", progress: 100 });
        const fd = new FormData();
        fd.set("url", uploaded.url);
        if (assistanceRequestId) fd.set("assistanceRequestId", assistanceRequestId);
        const add = await addListingPhoto(fd);

        if ("error" in add && add.error) {
          patchJob(id, { phase: "error", error: add.error, progress: 100 });
        } else {
          patchJob(id, { phase: "done", progress: 100 });
          onPhotoAttached();
        }
      } finally {
        inFlightRef.current -= 1;
        pumpQueueRef.current();
      }
    },
    [addListingPhoto, assistanceRequestId, onPhotoAttached, patchJob]
  );

  const pumpQueue = useCallback(() => {
    if (processingRef.current) return;
    processingRef.current = true;
    try {
      while (inFlightRef.current < MAX_CONCURRENT && queueRef.current.length > 0) {
        const next = queueRef.current.shift();
        if (!next) break;
        void runOne(next.id, next.file);
      }
    } finally {
      processingRef.current = false;
    }
  }, [runOne]);

  pumpQueueRef.current = pumpQueue;

  const enqueue = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;

      const reserved =
        jobs.filter((j) => j.phase !== "error").length +
        queueRef.current.length +
        inFlightRef.current;
      const { accepted, skippedNonImage, skippedOverLimit } = planWorkPhotoUploads(
        Array.from(files),
        existingPhotoCount,
        reserved
      );

      if (skippedNonImage > 0) {
        toast.error("Only image files (JPG, PNG, WebP) can be added as work photos.");
      }
      if (skippedOverLimit > 0) {
        toast.error("Maximum 12 work photos — extra files were not added.");
      }
      if (accepted.length === 0) return;

      toast.success(
        accepted.length === 1
          ? "Adding 1 photo — you can keep editing other steps."
          : `Adding ${accepted.length} photos — you can keep editing other steps.`
      );

      const newJobs: WorkPhotoUploadJob[] = accepted.map((file) => ({
        id: crypto.randomUUID(),
        fileName: shortFileName(file.name),
        progress: 0,
        phase: "queued",
      }));

      setJobs((prev) => [...prev, ...newJobs]);
      for (let i = 0; i < accepted.length; i += 1) {
        queueRef.current.push({ id: newJobs[i]!.id, file: accepted[i]! });
      }
      void pumpQueue();
    },
    [existingPhotoCount, jobs, pumpQueue, toast.error, toast.success]
  );

  const clearFinished = () => {
    setJobs((prev) => prev.filter((j) => j.phase !== "done" && j.phase !== "error"));
  };

  const hasFinished = jobs.some((j) => j.phase === "done" || j.phase === "error");

  return (
    <div className="kf-work-photo-upload">
      <label className="relative mt-4 block">
        <span className="kf-file-input">
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={disabled || atPhotoLimit}
            onChange={(e) => {
              enqueue(e.target.files);
              e.target.value = "";
            }}
          />
          {atPhotoLimit
            ? "Maximum work photos reached"
            : activeCount > 0
              ? "Add more photos"
              : "Tap to add photos (select several at once)"}
        </span>
      </label>

      {jobs.length > 0 ? (
        <div className="kf-work-photo-upload-queue" aria-live="polite">
          <div className="kf-work-photo-upload-queue-head">
            <p className="text-xs font-semibold text-[var(--kf-muted)]">
              {activeCount > 0
                ? `Uploading ${activeCount} photo${activeCount === 1 ? "" : "s"} — you can keep editing`
                : "Uploads finished"}
            </p>
            {hasFinished && activeCount === 0 ? (
              <button type="button" className="kf-link text-xs" onClick={clearFinished}>
                Dismiss
              </button>
            ) : null}
          </div>
          <ul className="kf-work-photo-upload-list">
            {jobs.map((job) => (
              <li key={job.id} className={`kf-work-photo-upload-item kf-work-photo-upload-item--${job.phase}`}>
                <JobStatusIcon job={job} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-[var(--kf-charcoal)]">{job.fileName}</p>
                  {job.phase === "error" && job.error ? (
                    <p className="text-[0.65rem] text-[var(--kf-terracotta)]">{job.error}</p>
                  ) : (
                    <ProgressTrack
                      className="kf-work-photo-upload-bar"
                      ariaValueNow={job.progress}
                      ariaLabel={`Upload progress for ${job.fileName}`}
                    >
                      <span
                        className={`kf-work-photo-upload-bar-fill${job.phase === "saving" ? " kf-work-photo-upload-bar-fill--pulse" : ""}`}
                        style={{
                          width:
                            job.phase === "queued"
                              ? "8%"
                              : job.phase === "done"
                                ? "100%"
                                : `${job.progress}%`,
                        }}
                      />
                    </ProgressTrack>
                  )}
                  <p className="text-[0.65rem] text-[var(--kf-muted-soft)]">
                    {phaseLabel(job)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function phaseLabel(job: WorkPhotoUploadJob): string {
  switch (job.phase) {
    case "queued":
      return "Waiting…";
    case "uploading":
      return `${job.progress}% uploaded`;
    case "saving":
      return "Saving to your listing…";
    case "done":
      return "Added";
    case "error":
      return "Failed";
    default:
      return "";
  }
}

function JobStatusIcon({ job }: { job: WorkPhotoUploadJob }) {
  if (job.phase === "done") {
    return <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--kf-forest)]" aria-hidden />;
  }
  if (job.phase === "error") {
    return <XCircle className="h-4 w-4 shrink-0 text-[var(--kf-danger)]" aria-hidden />;
  }
  return <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[var(--kf-forest)]" aria-hidden />;
}

function ProgressTrack({
  className,
  ariaValueNow,
  ariaLabel,
  children,
}: {
  className: string;
  ariaValueNow: number;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <div
      className={className}
      role="progressbar"
      aria-valuenow={ariaValueNow}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel}
    >
      {children}
    </div>
  );
}
