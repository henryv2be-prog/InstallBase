"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type CompilationStatus =
  | "idle"
  | "NONE"
  | "QUEUED"
  | "PROCESSING"
  | "READY"
  | "FAILED";

type StatusResponse = {
  status: CompilationStatus;
  generatedVideoUrl: string | null;
  generatedVideoPosterUrl: string | null;
  error: string | null;
};

export function useInstallVideoCompilation(postId: string | null) {
  const [status, setStatus] = useState<CompilationStatus>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  const applyPayload = useCallback((payload: StatusResponse) => {
    setStatus(payload.status === "NONE" ? "idle" : payload.status);
    setVideoUrl(payload.generatedVideoUrl);
    setPosterUrl(payload.generatedVideoPosterUrl);
    setError(payload.error);
  }, []);

  const poll = useCallback(async () => {
    if (!postId) return;
    const res = await fetch(`/api/install-video/${postId}/status`, { cache: "no-store" });
    if (!res.ok) return;
    const data = (await res.json()) as StatusResponse;
    applyPayload(data);
  }, [applyPayload, postId]);

  useEffect(() => {
    if (!postId) return;
    void poll();
    timerRef.current = window.setInterval(() => void poll(), 2500);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [poll, postId]);

  const regenerate = useCallback(async () => {
    if (!postId) return;
    setStatus("QUEUED");
    setError(null);
    await fetch(`/api/install-video/${postId}/regenerate`, { method: "POST" });
    await poll();
  }, [poll, postId]);

  const busy = status === "QUEUED" || status === "PROCESSING";

  return { status, videoUrl, posterUrl, error, busy, poll, regenerate };
}
