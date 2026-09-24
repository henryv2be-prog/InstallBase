"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { parseVideoCompilationOptions } from "@/lib/video-compilation/options";
import { previewUrlForTrack } from "@/lib/video-compilation/sound-tracks";
import { useVideoSoundLibrary } from "@/hooks/use-video-sound-library";

export function useImmersiveSoundtrack(videoCompilationOptions: unknown, active: boolean) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { tracks } = useVideoSoundLibrary();

  const trackIds = useMemo(() => tracks.map((t) => t.id), [tracks]);
  const compilation = useMemo(
    () => parseVideoCompilationOptions(videoCompilationOptions, trackIds),
    [videoCompilationOptions, trackIds]
  );
  const track = compilation.audio === "none" ? null : tracks.find((t) => t.id === compilation.audio) ?? null;
  const audioSrc = previewUrlForTrack(track);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);

  const pauseAudio = useCallback(() => {
    audioRef.current?.pause();
    setPlaying(false);
  }, []);

  const playAudio = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    try {
      audio.muted = muted;
      await audio.play();
      setPlaying(true);
    } catch {
      setPlaying(false);
    }
  }, [audioSrc, muted]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    audio.muted = muted;
  }, [audioSrc, muted]);

  useEffect(() => {
    if (!audioSrc) return;
    const audio = audioRef.current;
    if (!audio) return;

    if (!active) {
      pauseAudio();
      return;
    }

    audio.loop = true;
    void playAudio();
  }, [active, audioSrc, pauseAudio, playAudio]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) void playAudio();
    else pauseAudio();
  }, [audioSrc, pauseAudio, playAudio]);

  const toggleMute = useCallback(() => {
    setMuted((m) => !m);
  }, []);

  return {
    audioRef,
    audioSrc,
    playing,
    muted,
    togglePlay,
    toggleMute,
  };
}
