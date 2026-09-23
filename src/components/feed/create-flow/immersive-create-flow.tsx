"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CreateFlowChrome } from "@/components/feed/create-flow/create-flow-chrome";
import { CreateFlowMediaStep } from "@/components/feed/create-flow/media-step";
import { CreateFlowIntentStep } from "@/components/feed/create-flow/intent-step";
import { CreateFlowMediaReadyStep } from "@/components/feed/create-flow/media-ready-step";
import { CreateFlowContentStep } from "@/components/feed/create-flow/content-step";
import { CreateFlowEffectsStep } from "@/components/feed/create-flow/effects-step";
import { CreateFlowMusicStep } from "@/components/feed/create-flow/music-step";
import { CreateFlowCaptionStep } from "@/components/feed/create-flow/caption-step";
import type { CreateFlowMediaItem, CreateFlowStep, FlowPostKind } from "@/components/feed/create-flow/types";
import { flowKindToPostType } from "@/components/feed/create-flow/types";
import type { WorkDetailsFormState } from "@/components/feed/work-details-fields";
import type { VideoCompilationOptions, VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
import type { VideoCompilationStyleId } from "@/lib/video-compilation/style-presets";
import type { CompilationStatus } from "@/hooks/use-install-video-compilation";
import type { VideoSoundTrackClient } from "@/lib/video-compilation/sound-tracks";
import { useVideoSoundLibrary } from "@/hooks/use-video-sound-library";
import { shouldAutoCompileInstallVideo } from "@/lib/video-compilation/eligibility";

export interface ImmersiveCreateFlowProps {
  fileInput: React.ReactNode;
  media: CreateFlowMediaItem[];
  uploading: boolean;
  failedCount: number;
  readyUrls: string[];
  content: string;
  title: string;
  work: WorkDetailsFormState;
  showWorkDetails: boolean;
  onContentChange: (value: string) => void;
  onTitleChange: (value: string) => void;
  onToggleWorkDetails: () => void;
  onWorkChange: (patch: Partial<WorkDetailsFormState>) => void;
  onAddClick: () => void;
  onRemoveMedia: (id: string) => void;
  onRetryMedia: (item: CreateFlowMediaItem) => void;
  onSetPostType: (type: ReturnType<typeof flowKindToPostType>) => void;
  installVideoPostId: string | null;
  compilationStatus: CompilationStatus;
  videoUrl: string | null;
  posterUrl: string | null;
  compilationError: string | null;
  videoCompilationOptions: VideoCompilationOptions;
  onCompilationOptionsChange: (next: VideoCompilationOptions) => void;
  previewSelectedAudio: VideoCompilationAudioSelection;
  onPreviewAudioChange: (audio: VideoCompilationAudioSelection) => void;
  onStartInstallVideo: (optionsOverride?: VideoCompilationOptions) => Promise<void>;
  onPublishInstallVideo: () => void;
  onSubmitStandardPost: () => void;
  installVideoPosting: boolean;
  standardPostPending: boolean;
  initialStep?: CreateFlowStep;
  initialFlowKind?: FlowPostKind | null;
}

export function ImmersiveCreateFlow({
  fileInput,
  media,
  uploading,
  failedCount,
  readyUrls,
  content,
  title,
  work,
  showWorkDetails,
  onContentChange,
  onTitleChange,
  onToggleWorkDetails,
  onWorkChange,
  onAddClick,
  onRemoveMedia,
  onRetryMedia,
  onSetPostType,
  installVideoPostId,
  compilationStatus,
  videoUrl,
  posterUrl,
  compilationError,
  videoCompilationOptions,
  onCompilationOptionsChange,
  previewSelectedAudio,
  onPreviewAudioChange,
  onStartInstallVideo,
  onPublishInstallVideo,
  onSubmitStandardPost,
  installVideoPosting,
  standardPostPending,
  initialStep = "intent",
  initialFlowKind = null,
}: ImmersiveCreateFlowProps) {
  const [step, setStep] = useState<CreateFlowStep>(initialStep);
  const [flowKind, setFlowKind] = useState<FlowPostKind | null>(initialFlowKind);
  const [effectsContinuing, setEffectsContinuing] = useState(false);
  const lastRenderedStyleRef = useRef<VideoCompilationStyleId | null>(null);
  const { tracks, loading: tracksLoading } = useVideoSoundLibrary();
  const offeredDefaultSound = useRef(false);

  const stylePreviewUrls = useMemo(
    () =>
      media
        .filter((item) => item.status === "ready")
        .map((item) => item.previewUrl),
    [media]
  );

  const installVideoEligible = shouldAutoCompileInstallVideo(
    media.map((item) => ({ kind: item.kind, status: item.status }))
  );

  const mediaContinueDisabled =
    uploading || failedCount > 0 || (media.length > 0 && readyUrls.length === 0);

  const goBack = useCallback(() => {
    switch (step) {
      case "media":
        setStep("intent");
        break;
      case "media-ready":
        setStep("media");
        break;
      case "content":
        setStep(flowKind === "question" ? "media" : "media-ready");
        break;
      case "effects":
        setStep("media-ready");
        break;
      case "music":
        setStep("effects");
        break;
      case "caption":
        setStep("music");
        break;
      default:
        break;
    }
  }, [step, flowKind]);

  const startShareWork = useCallback(() => {
    setFlowKind("share_work");
    onSetPostType("POST");
    setStep("media");
  }, [onSetPostType]);

  const startQuestion = useCallback(() => {
    setFlowKind("question");
    onSetPostType("QUESTION");
    setStep("media");
  }, [onSetPostType]);

  const continueFromMedia = useCallback(() => {
    if (flowKind === "question") {
      setStep("content");
      return;
    }
    if (media.length === 0) return;
    setFlowKind("share_work");
    onSetPostType("POST");
    setStep("media-ready");
  }, [flowKind, media.length, onSetPostType]);

  const continueWithPhotos = useCallback(() => {
    setFlowKind("photo_video");
    onSetPostType("POST");
    setStep("content");
  }, [onSetPostType]);

  const startAutoVideo = useCallback(() => {
    setFlowKind("auto_video");
    onSetPostType("POST");
    setStep("effects");
  }, [onSetPostType]);

  const needsHdRender = useCallback(() => {
    if (!installVideoPostId) return true;
    if (compilationStatus !== "READY" || !videoUrl) return true;
    if (lastRenderedStyleRef.current !== videoCompilationOptions.style) return true;
    return false;
  }, [installVideoPostId, compilationStatus, videoUrl, videoCompilationOptions.style]);

  const startHdRenderIfNeeded = useCallback(async () => {
    if (!needsHdRender()) return;
    await onStartInstallVideo(videoCompilationOptions);
    lastRenderedStyleRef.current = videoCompilationOptions.style;
  }, [needsHdRender, onStartInstallVideo, videoCompilationOptions]);

  const handleEffectsContinue = async () => {
    setEffectsContinuing(true);
    setStep("music");
    try {
      await startHdRenderIfNeeded();
    } finally {
      setEffectsContinuing(false);
    }
  };

  useEffect(() => {
    if (step !== "music" && step !== "caption") return;
    if (tracks.length === 0) return;
    if (previewSelectedAudio !== "none" && tracks.some((t) => t.id === previewSelectedAudio)) return;
    if (!offeredDefaultSound.current && previewSelectedAudio === "none") {
      offeredDefaultSound.current = true;
      onPreviewAudioChange(tracks[0]!.id);
    }
  }, [step, tracks, previewSelectedAudio, onPreviewAudioChange]);

  useEffect(() => {
    offeredDefaultSound.current = false;
  }, [videoUrl]);

  useEffect(() => {
    if (compilationStatus === "READY" && videoUrl) {
      lastRenderedStyleRef.current = videoCompilationOptions.style;
    }
  }, [compilationStatus, videoUrl, videoCompilationOptions.style]);

  const contentCanPost =
    flowKind === "question"
      ? content.trim().length > 0 || readyUrls.length > 0
      : readyUrls.length > 0 || content.trim().length > 0;

  const showChromeBack = step !== "intent";

  const shareWorkContinueDisabled =
    flowKind === "share_work" && (media.length === 0 || mediaContinueDisabled);

  return (
    <div className="create-flow-immersive relative flex h-full max-h-full min-h-0 flex-col overflow-hidden">
      {fileInput}
      {showChromeBack && <CreateFlowChrome step={step} flowKind={flowKind} onBack={goBack} />}

      <div
        className={cn(
          "min-h-0 flex-1 transition-opacity duration-300 motion-reduce:transition-none",
          step === "effects" || step === "music" || step === "caption" ? "px-0" : "px-1 sm:px-2"
        )}
      >
        {step === "intent" && <CreateFlowIntentStep onShareWork={startShareWork} onAskQuestion={startQuestion} />}

        {step === "media" && flowKind && (
          <CreateFlowMediaStep
            flowKind={flowKind}
            media={media}
            onAddClick={onAddClick}
            onRemove={onRemoveMedia}
            onRetry={onRetryMedia}
            onContinue={continueFromMedia}
            continueDisabled={
              flowKind === "share_work" ? shareWorkContinueDisabled : mediaContinueDisabled
            }
            uploading={uploading}
          />
        )}

        {step === "media-ready" && flowKind === "share_work" && (
          <CreateFlowMediaReadyStep
            autoVideoEnabled={installVideoEligible && !uploading && failedCount === 0}
            onCreateVideo={startAutoVideo}
            onContinuePhotos={continueWithPhotos}
          />
        )}

        {step === "content" && flowKind && flowKind !== "auto_video" && (
          <CreateFlowContentStep
            flowKind={flowKind}
            media={media}
            content={content}
            title={title}
            onContentChange={onContentChange}
            onTitleChange={onTitleChange}
            work={work}
            showWorkDetails={showWorkDetails}
            onToggleWorkDetails={onToggleWorkDetails}
            onWorkChange={onWorkChange}
            onPost={onSubmitStandardPost}
            posting={standardPostPending}
            postDisabled={!contentCanPost || uploading}
          />
        )}

        {step === "effects" && flowKind === "auto_video" && (
          <CreateFlowEffectsStep
            previewImageUrls={stylePreviewUrls}
            compilationOptions={videoCompilationOptions}
            onStyleChange={(id) => onCompilationOptionsChange({ ...videoCompilationOptions, style: id })}
            onContinue={() => void handleEffectsContinue()}
            continuing={effectsContinuing || installVideoPosting}
          />
        )}

        {step === "music" && flowKind === "auto_video" && (
          <CreateFlowMusicStep
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            compilationStatus={compilationStatus}
            compilationError={compilationError}
            previewImageUrls={stylePreviewUrls}
            styleId={videoCompilationOptions.style}
            selectedAudio={previewSelectedAudio}
            onAudioChange={onPreviewAudioChange}
            tracks={tracks as VideoSoundTrackClient[]}
            tracksLoading={tracksLoading}
            onContinue={() => setStep("caption")}
            onRetryRender={() => void startHdRenderIfNeeded()}
          />
        )}

        {step === "caption" && flowKind === "auto_video" && videoUrl && (
          <CreateFlowCaptionStep
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            selectedAudio={previewSelectedAudio}
            tracks={tracks as VideoSoundTrackClient[]}
            content={content}
            onContentChange={onContentChange}
            work={work}
            showWorkDetails={showWorkDetails}
            onToggleWorkDetails={onToggleWorkDetails}
            onWorkChange={onWorkChange}
            onPost={onPublishInstallVideo}
            posting={installVideoPosting}
          />
        )}
      </div>
    </div>
  );
}
