"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { CreateFlowChrome } from "@/components/feed/create-flow/create-flow-chrome";
import { CreateFlowMediaStep } from "@/components/feed/create-flow/media-step";
import { CreateFlowPostTypeStep } from "@/components/feed/create-flow/post-type-step";
import { CreateFlowContentStep } from "@/components/feed/create-flow/content-step";
import { CreateFlowEffectsStep } from "@/components/feed/create-flow/effects-step";
import { CreateFlowMusicStep } from "@/components/feed/create-flow/music-step";
import { CreateFlowCaptionStep } from "@/components/feed/create-flow/caption-step";
import type { CreateFlowMediaItem, CreateFlowStep, FlowPostKind } from "@/components/feed/create-flow/types";
import { flowKindToPostType } from "@/components/feed/create-flow/types";
import type { WorkDetailsFormState } from "@/components/feed/work-details-fields";
import type { VideoCompilationOptions, VideoCompilationAudioSelection } from "@/lib/video-compilation/options";
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
  onStartInstallVideo: () => Promise<void>;
  onRecompileInstallVideo: (options: VideoCompilationOptions) => Promise<void>;
  onPublishInstallVideo: () => void;
  onPublishAsCarousel: () => void;
  onRegenerateVideo: () => void;
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
  onRecompileInstallVideo,
  onPublishInstallVideo,
  onPublishAsCarousel,
  onRegenerateVideo,
  onSubmitStandardPost,
  installVideoPosting,
  standardPostPending,
  initialStep = "media",
  initialFlowKind = null,
}: ImmersiveCreateFlowProps) {
  const [step, setStep] = useState<CreateFlowStep>(initialStep);
  const [flowKind, setFlowKind] = useState<FlowPostKind | null>(initialFlowKind);
  const [styleBusy, setStyleBusy] = useState(false);
  const startedCompileRef = useRef(false);
  const { tracks, loading: tracksLoading } = useVideoSoundLibrary();
  const offeredDefaultSound = useRef(false);

  const installVideoEligible = shouldAutoCompileInstallVideo(
    media.map((item) => ({ kind: item.kind, status: item.status }))
  );

  const photoVideoEnabled = readyUrls.length > 0;
  const autoVideoEnabled = installVideoEligible && !uploading && failedCount === 0;

  const mediaContinueDisabled =
    uploading || failedCount > 0 || (media.length > 0 && readyUrls.length === 0);

  const goBack = useCallback(() => {
    switch (step) {
      case "post-type":
        setStep("media");
        break;
      case "content":
        setStep("post-type");
        break;
      case "effects":
        startedCompileRef.current = false;
        setStep("post-type");
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
  }, [step]);

  const selectFlowKind = useCallback(
    (kind: FlowPostKind) => {
      setFlowKind(kind);
      onSetPostType(flowKindToPostType(kind));
      if (kind === "auto_video") {
        setStep("effects");
        startedCompileRef.current = false;
      } else {
        setStep("content");
      }
    },
    [onSetPostType]
  );

  useEffect(() => {
    if (step !== "effects" || flowKind !== "auto_video") return;
    if (startedCompileRef.current) return;
    if (installVideoPostId && compilationStatus === "READY") {
      startedCompileRef.current = true;
      return;
    }
    if (installVideoPosting) return;
    startedCompileRef.current = true;
    void onStartInstallVideo();
  }, [
    step,
    flowKind,
    installVideoPostId,
    compilationStatus,
    installVideoPosting,
    onStartInstallVideo,
  ]);

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
    if (compilationStatus === "FAILED") {
      startedCompileRef.current = false;
    }
  }, [compilationStatus]);

  const handleStyleChange = async (styleId: VideoCompilationOptions["style"]) => {
    if (styleId === videoCompilationOptions.style) return;
    const next = { ...videoCompilationOptions, style: styleId };
    onCompilationOptionsChange(next);
    setStyleBusy(true);
    try {
      await onRecompileInstallVideo(next);
    } finally {
      setStyleBusy(false);
    }
  };

  const contentCanPost =
    flowKind === "question"
      ? content.trim().length > 0 || readyUrls.length > 0
      : readyUrls.length > 0 || content.trim().length > 0;

  const showChromeBack = step !== "media";

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
        {step === "media" && (
          <CreateFlowMediaStep
            media={media}
            onAddClick={onAddClick}
            onRemove={onRemoveMedia}
            onRetry={onRetryMedia}
            onContinue={() => {
              if (media.length === 0) {
                setFlowKind("question");
                onSetPostType("QUESTION");
                setStep("content");
                return;
              }
              setStep("post-type");
            }}
            continueDisabled={mediaContinueDisabled}
            uploading={uploading}
          />
        )}

        {step === "post-type" && (
          <CreateFlowPostTypeStep
            autoVideoEnabled={autoVideoEnabled}
            photoVideoEnabled={photoVideoEnabled}
            onSelect={selectFlowKind}
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
            status={compilationStatus}
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            error={compilationError}
            compilationOptions={videoCompilationOptions}
            onStyleChange={(id) => void handleStyleChange(id)}
            styleBusy={styleBusy}
            onContinue={() => setStep("music")}
            continueDisabled={!videoUrl || compilationStatus !== "READY"}
            onRegenerate={onRegenerateVideo}
            onPostAsPhotos={onPublishAsCarousel}
            onRetryStart={() => {
              startedCompileRef.current = false;
              void onStartInstallVideo();
            }}
          />
        )}

        {step === "music" && flowKind === "auto_video" && videoUrl && (
          <CreateFlowMusicStep
            videoUrl={videoUrl}
            posterUrl={posterUrl}
            selectedAudio={previewSelectedAudio}
            onAudioChange={onPreviewAudioChange}
            tracks={tracks as VideoSoundTrackClient[]}
            tracksLoading={tracksLoading}
            onContinue={() => setStep("caption")}
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
