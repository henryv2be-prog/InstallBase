"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Camera,
  HelpCircle,
  FolderKanban,
  ImagePlus,
  X,
  Loader2,
  RotateCcw,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  deleteInstallVideoDraft,
  publishInstallVideoAsCarousel,
  publishInstallVideoPost,
  updatePost,
} from "@/lib/actions";
import { uploadMediaFile } from "@/lib/client-upload";
import { useMediaUpload, type PendingPostPayload } from "@/components/feed/media-upload-context";
import { MAX_POST_MEDIA, prepareMediaFile } from "@/lib/prepare-media";
import { formatUploadLimit, maxBytesForUpload } from "@/lib/upload-limits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PostIntent, PostType } from "@/generated/prisma/client";
import { parseWorkDetails } from "@/lib/work-posts";
import {
  WorkDetailsFields,
  type WorkDetailsFormState,
} from "@/components/feed/work-details-fields";
import { shouldAutoCompileInstallVideo } from "@/lib/video-compilation/eligibility";
import { InstallVideoPreviewStage } from "@/components/feed/install-video-preview-stage";
import { useInstallVideoCompilation } from "@/hooks/use-install-video-compilation";

const DRAFT_KEY = "ib-create-draft-v4";

type MediaItem = {
  id: string;
  previewUrl: string;
  serverUrl?: string;
  kind: "image" | "video";
  status: "uploading" | "ready" | "error";
  progress?: number;
  error?: string;
};

type Draft = {
  type: PostType;
  content: string;
  title: string;
  media: { url: string; kind: "image" | "video" }[];
  work: WorkDetailsFormState;
  showWorkDetails: boolean;
};

const defaultWorkState = (): WorkDetailsFormState => ({
  postIntent: "GENERAL",
  workTrade: "",
  workProjectType: "",
  workDeviceCount: "",
  workDate: "",
  workEquipmentNotes: "",
  location: "",
  showExactLocation: false,
});

function readDraft(): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const draft = JSON.parse(raw) as Draft & { location?: string };
    if (draft.location && draft.work && !draft.work.location) {
      draft.work.location = draft.location;
    }
    return draft;
  } catch {
    return null;
  }
}

function writeDraft(draft: Draft) {
  const hasText = Boolean(
    draft.content.trim() ||
      draft.title.trim() ||
      draft.work.location.trim() ||
      draft.work.workTrade.trim()
  );
  const hasMedia = draft.media.length > 0;
  if (!hasText && !hasMedia && draft.type === "POST") {
    sessionStorage.removeItem(DRAFT_KEY);
    return;
  }
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

function clearDraft() {
  sessionStorage.removeItem(DRAFT_KEY);
}

function isVideoFile(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
}

interface EditPostInitial {
  id: string;
  type: PostType;
  content: string;
  title: string | null;
  postIntent: PostIntent;
  location: string | null;
  showExactLocation: boolean;
  workDate: Date | null;
  workDetails: unknown;
  categories: { category: { name: string } }[];
  media: { url: string; type: string }[];
}

interface CreatePostCardProps {
  userName?: string | null;
  userImage?: string | null;
  compact?: boolean;
  editPost?: EditPostInitial;
}

function buildWorkStateFromPost(post: EditPostInitial): WorkDetailsFormState {
  const workDetails = parseWorkDetails(post.workDetails);
  return {
    postIntent: post.postIntent,
    workTrade: workDetails.trade ?? post.categories[0]?.category.name ?? "",
    workProjectType: workDetails.projectType ?? "",
    workDeviceCount: workDetails.deviceCount ?? "",
    workDate: post.workDate ? post.workDate.toISOString().slice(0, 10) : "",
    workEquipmentNotes: workDetails.equipmentNotes ?? "",
    location: post.location ?? "",
    showExactLocation: post.showExactLocation,
  };
}

function hasWorkDetails(state: WorkDetailsFormState) {
  return Boolean(
    state.workTrade.trim() ||
      state.workProjectType.trim() ||
      state.workDeviceCount.trim() ||
      state.workDate.trim() ||
      state.workEquipmentNotes.trim() ||
      state.location.trim() ||
      state.postIntent !== "GENERAL"
  );
}

export function CreatePostCard({ userName, compact, editPost }: CreatePostCardProps) {
  const isEditing = Boolean(editPost);
  const globalUpload = useMediaUpload();
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [editPending, startEditTransition] = useTransition();
  const [expanded, setExpanded] = useState(!compact || isEditing);
  const [type, setType] = useState<PostType>(editPost?.type ?? "POST");
  const [content, setContent] = useState(editPost?.content ?? "");
  const [title, setTitle] = useState(editPost?.title ?? "");
  const [work, setWork] = useState<WorkDetailsFormState>(
    editPost ? buildWorkStateFromPost(editPost) : defaultWorkState()
  );
  const [showWorkDetails, setShowWorkDetails] = useState(
    editPost ? hasWorkDetails(buildWorkStateFromPost(editPost)) : false
  );
  const [editMedia, setEditMedia] = useState<MediaItem[]>(
    editPost
      ? editPost.media.map((item) => ({
          id: crypto.randomUUID(),
          previewUrl: item.url,
          serverUrl: item.url,
          kind: item.type === "video" ? "video" : "image",
          status: "ready" as const,
        }))
      : []
  );
  const [hydrated, setHydrated] = useState(isEditing);
  const [installVideoStep, setInstallVideoStep] = useState<"compose" | "preview">("compose");
  const [installVideoPostId, setInstallVideoPostId] = useState<string | null>(null);
  const [installVideoPosting, setInstallVideoPosting] = useState(false);
  const installCompilation = useInstallVideoCompilation(installVideoPostId);
  const autoCompileStartedRef = useRef(false);
  const editMediaRef = useRef(editMedia);
  editMediaRef.current = editMedia;

  const media = isEditing ? editMedia : globalUpload.items;
  const uploading = isEditing
    ? editMedia.some((item) => item.status === "uploading")
    : globalUpload.isUploading;
  const failedCount = isEditing
    ? editMedia.filter((item) => item.status === "error").length
    : globalUpload.failedCount;
  const readyUrls = isEditing
    ? editMedia.filter((item) => item.status === "ready" && item.serverUrl).map((item) => item.serverUrl!)
    : globalUpload.readyUrls;
  const postQueued = !isEditing && globalUpload.postQueued;
  const pending = isEditing ? editPending : globalUpload.isSubmitting;

  useEffect(() => {
    if (isEditing) return;
    const draft = readDraft();
    if (draft) {
      setType(draft.type === "BRAG" ? "POST" : draft.type);
      setContent(draft.content);
      setTitle(draft.title);
      setWork(draft.work ?? defaultWorkState());
      setShowWorkDetails(draft.showWorkDetails ?? false);
      if (draft.media.length > 0) {
        globalUpload.seedReadyMedia(draft.media);
      }
      if (compact) setExpanded(true);
    }
    setHydrated(true);
  }, [compact]);

  useEffect(() => {
    if (!hydrated || isEditing) return;
    writeDraft({
      type,
      content,
      title,
      work,
      showWorkDetails,
      media: media
        .filter((item) => item.status === "ready" && item.serverUrl)
        .map((item) => ({ url: item.serverUrl!, kind: item.kind })),
    });
  }, [hydrated, isEditing, type, content, title, work, showWorkDetails, media]);

  useEffect(() => {
    if (isEditing) return;
    if (type === "PROJECT") {
      setWork((prev) => ({ ...prev, postIntent: "PROJECT_INSTALLATION" }));
    } else if (type === "QUESTION") {
      setWork((prev) => ({ ...prev, postIntent: "GENERAL" }));
    }
  }, [isEditing, type]);

  useEffect(() => {
    if (!isEditing && compact && globalUpload.items.length > 0) {
      setExpanded(true);
    }
  }, [compact, isEditing, globalUpload.items.length]);

  useEffect(() => {
    if (isEditing) return;
    return () => {
      for (const item of editMediaRef.current) {
        if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, [isEditing]);

  const hasText = content.trim().length > 0 || title.trim().length > 0;
  const installVideoEligible =
    !isEditing &&
    (type === "POST" || type === "VIDEO") &&
    shouldAutoCompileInstallVideo(
      media.map((item) => ({
        kind: item.kind,
        status: item.status,
      }))
    );

  const canPost =
    !pending &&
    failedCount === 0 &&
    (hasText || readyUrls.length > 0 || media.some((item) => item.status === "uploading"));

  const buildInstallVideoDraftPayload = () => ({
    content,
    title,
    postIntent: work.postIntent,
    location: work.location,
    showExactLocation: work.showExactLocation,
    workTrade: work.workTrade,
    workProjectType: work.workProjectType,
    workDeviceCount: work.workDeviceCount,
    workDate: work.workDate,
    workEquipmentNotes: work.workEquipmentNotes,
    type,
  });

  const startInstallVideoCompilation = async () => {
    if (uploading) {
      toast.error("Wait for uploads to finish first");
      return;
    }
    const readyItems = media.filter((item) => item.status === "ready" && item.serverUrl);
    if (readyItems.length < 2) {
      toast.error("Add at least two photos or videos");
      return;
    }

    setInstallVideoPosting(true);
    try {
      const response = await fetch("/api/install-video/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          postId: installVideoPostId ?? undefined,
          media: readyItems.map((item, order) => ({
            url: item.serverUrl!,
            type: item.kind,
            order,
          })),
          draft: buildInstallVideoDraftPayload(),
        }),
      });
      const data = (await response.json()) as { postId?: string; error?: string };
      if (!response.ok || !data.postId) {
        toast.error(data.error ?? "Could not start video generation");
        return;
      }
      setInstallVideoPostId(data.postId);
      setInstallVideoStep("preview");
      toast.success("Building your install video…");
    } catch {
      toast.error("Could not start video generation");
    } finally {
      setInstallVideoPosting(false);
    }
  };

  useEffect(() => {
    if (!hydrated || isEditing || installVideoStep !== "compose") return;
    if (!installVideoEligible || uploading || installVideoPostId || autoCompileStartedRef.current) return;
    autoCompileStartedRef.current = true;
    void startInstallVideoCompilation();
  }, [
    hydrated,
    isEditing,
    installVideoStep,
    installVideoEligible,
    uploading,
    installVideoPostId,
    readyUrls.length,
  ]);

  const publishInstallVideo = async () => {
    if (!installVideoPostId) return;
    setInstallVideoPosting(true);
    try {
      const formData = new FormData();
      formData.append("postId", installVideoPostId);
      formData.append("content", content);
      if (title) formData.append("title", title);
      formData.append("postIntent", work.postIntent);
      formData.append("showExactLocation", work.showExactLocation ? "true" : "false");
      if (work.location.trim()) formData.append("location", work.location.trim());
      if (work.workTrade) formData.append("workTrade", work.workTrade);
      if (work.workProjectType) formData.append("workProjectType", work.workProjectType);
      if (work.workDeviceCount) formData.append("workDeviceCount", work.workDeviceCount);
      if (work.workDate) formData.append("workDate", work.workDate);
      if (work.workEquipmentNotes) formData.append("workEquipmentNotes", work.workEquipmentNotes);

      const result = await publishInstallVideoPost(formData);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Posted!");
      resetComposer();
      router.push(`/post/${installVideoPostId}`);
      router.refresh();
    } catch {
      toast.error("Failed to publish");
    } finally {
      setInstallVideoPosting(false);
    }
  };

  const publishAsCarouselFallback = async () => {
    if (!installVideoPostId) return;
    setInstallVideoPosting(true);
    try {
      const formData = new FormData();
      formData.append("postId", installVideoPostId);
      formData.append("content", content);
      const result = await publishInstallVideoAsCarousel(formData);
      if (result && "error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Posted as photos");
      resetComposer();
      router.push(`/post/${result.postId}`);
      router.refresh();
    } catch {
      toast.error("Failed to publish");
    } finally {
      setInstallVideoPosting(false);
    }
  };

  const exitInstallVideoPreview = async () => {
    setInstallVideoStep("compose");
  };

  const uploadEditFile = async (id: string, file: File) => {
    try {
      const prepared = await prepareMediaFile(file);
      const limit = maxBytesForUpload(prepared);
      if (prepared.size > limit) {
        throw new Error(
          prepared.type.startsWith("video/")
            ? `Video must be ${formatUploadLimit(limit)} or smaller`
            : "Photo is still too large after compression"
        );
      }
      const result = await uploadMediaFile(prepared, (progress) => {
        setEditMedia((prev) =>
          prev.map((item) => (item.id === id ? { ...item, progress } : item))
        );
      });
      if ("error" in result) throw new Error(result.error);
      setEditMedia((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "ready",
                serverUrl: result.url,
                kind: result.type === "video" ? "video" : "image",
                progress: undefined,
                error: undefined,
              }
            : item
        )
      );
    } catch (error) {
      setEditMedia((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
            : item
        )
      );
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    if (!isEditing) {
      globalUpload.addFiles(fileList);
      setExpanded(true);
      return;
    }

    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;
    const room = MAX_POST_MEDIA - editMedia.length;
    if (room <= 0) {
      toast.error(`You can add up to ${MAX_POST_MEDIA} photos`);
      return;
    }
    const chosen = incoming.slice(0, room);
    if (incoming.length > room) {
      toast.error(`Added ${room} of ${incoming.length} — ${MAX_POST_MEDIA} photo limit`);
    }

    const next: MediaItem[] = chosen.map((file) => ({
      id: crypto.randomUUID(),
      previewUrl: URL.createObjectURL(file),
      kind: isVideoFile(file) ? "video" : "image",
      status: "uploading",
    }));

    setEditMedia((prev) => [...prev, ...next]);
    setExpanded(true);
    for (const [index, item] of next.entries()) {
      void uploadEditFile(item.id, chosen[index]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    addFiles(files);
    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    if (!isEditing) {
      globalUpload.removeItem(id);
      return;
    }
    setEditMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const retryMedia = (item: MediaItem) => {
    if (!isEditing) {
      globalUpload.retryItem(item.id);
      return;
    }
    if (!item.previewUrl.startsWith("blob:")) {
      toast.error("Choose the photo again to retry");
      fileRef.current?.click();
      return;
    }
    setEditMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, status: "uploading", error: undefined, progress: 0 } : m)));
    void fetch(item.previewUrl)
      .then((res) => res.blob())
      .then((blob) => {
        const name = item.kind === "video" ? "video.mp4" : "photo.jpg";
        const type = item.kind === "video" ? blob.type || "video/mp4" : blob.type || "image/jpeg";
        return uploadEditFile(item.id, new File([blob], name, { type }));
      });
  };

  const buildPayload = (): PendingPostPayload => ({
    type,
    content,
    title,
    work,
    editPostId: editPost?.id,
  });

  const resetComposer = () => {
    if (installVideoPostId) {
      void deleteInstallVideoDraft(installVideoPostId);
    }
    setInstallVideoStep("compose");
    setInstallVideoPostId(null);
    autoCompileStartedRef.current = false;
    if (isEditing) {
      for (const item of editMedia) {
        if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      }
      setEditMedia([]);
    } else {
      globalUpload.clearItems();
      globalUpload.cancelQueuedPost();
    }
    setContent("");
    setTitle("");
    setWork(defaultWorkState());
    setShowWorkDetails(false);
    setType("POST");
    clearDraft();
    if (compact) setExpanded(false);
  };

  const performEditSubmit = () => {
    if (!content.trim() && readyUrls.length === 0) {
      toast.error("Add a photo or write something first");
      return;
    }
    const failed = editMedia.filter((item) => item.status === "error").length;
    startEditTransition(async () => {
      const formData = new FormData();
      formData.append("postId", editPost!.id);
      formData.append("content", content);
      if (title) formData.append("title", title);
      formData.append("postIntent", work.postIntent);
      formData.append("showExactLocation", work.showExactLocation ? "true" : "false");
      if (work.location.trim()) formData.append("location", work.location.trim());
      if (work.workTrade) formData.append("workTrade", work.workTrade);
      if (work.workProjectType) formData.append("workProjectType", work.workProjectType);
      if (work.workDeviceCount) formData.append("workDeviceCount", work.workDeviceCount);
      if (work.workDate) formData.append("workDate", work.workDate);
      if (work.workEquipmentNotes) formData.append("workEquipmentNotes", work.workEquipmentNotes);
      readyUrls.forEach((url) => formData.append("mediaUrls", url));
      try {
        const result = await updatePost(formData);
        if (result && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(failed ? "Updated — some photos didn’t upload" : "Post updated");
        resetComposer();
        router.push(`/post/${editPost!.id}`);
        router.refresh();
      } catch {
        toast.error("Failed to update post");
      }
    });
  };

  const handleSubmit = () => {
    if (isEditing) {
      if (uploading) {
        toast.error("Wait for uploads to finish before saving");
        return;
      }
      performEditSubmit();
      return;
    }

    if (uploading && !hasText) {
      toast.error("Write your question or caption while the video uploads");
      return;
    }

    if (installVideoEligible && !uploading) {
      void startInstallVideoCompilation();
      return;
    }

    globalUpload.submitNow(buildPayload());
  };

  const fileInput = (
    <input
      ref={fileRef}
      type="file"
      accept="image/*,image/heic,image/heif,.heic,.heif,video/mp4,video/webm,video/quicktime"
      multiple
      className="sr-only"
      onChange={handleFileChange}
    />
  );

  if (compact && !expanded && !isEditing) {
    const openMedia = (e: React.MouseEvent) => {
      e.stopPropagation();
      setType("POST");
      setExpanded(true);
    };
    const openQuestion = (e: React.MouseEvent) => {
      e.stopPropagation();
      setType("QUESTION");
      setExpanded(true);
    };

    return (
      <Card className="glass-card cursor-pointer transition-shadow hover:shadow-md" onClick={() => setExpanded(true)}>
        {fileInput}
        <CardContent className="p-4">
          <p className="text-muted">
            What&apos;s happening on your install, {userName?.split(" ")[0] ?? "installer"}?
          </p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={openMedia}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm font-medium text-primary hover:bg-card"
            >
              <Camera className="h-4 w-4" />
              Photo or Video
            </button>
            <button
              type="button"
              onClick={openQuestion}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-border bg-card/60 px-3 py-2 text-sm font-medium text-muted hover:bg-card hover:text-foreground"
            >
              <HelpCircle className="h-4 w-4" />
              Ask
            </button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card">
      {fileInput}
      <CardContent className={cn("p-5", compact && "pt-5")}>
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">
          {isEditing
            ? "Edit your post"
            : installVideoStep === "preview"
              ? "Preview install video"
              : "What's happening on your install?"}
        </h2>

        {installVideoStep === "preview" && !isEditing ? (
          <>
          <Textarea
            placeholder="Add a caption for your install…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={2}
            className="mb-3"
          />
          <InstallVideoPreviewStage
            status={installCompilation.status}
            videoUrl={installCompilation.videoUrl}
            posterUrl={installCompilation.posterUrl}
            error={installCompilation.error}
            onBack={() => void exitInstallVideoPreview()}
            onRegenerate={() => void installCompilation.regenerate()}
            onPost={() => void publishInstallVideo()}
            onPostAsPhotos={() => void publishAsCarouselFallback()}
            posting={installVideoPosting}
          />
          </>
        ) : (
          <>
        {!isEditing && (
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant={type === "POST" || type === "VIDEO" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("POST")}
          >
            <Camera className="h-4 w-4" />
            Photo / Video
          </Button>
          <Button
            type="button"
            variant={type === "QUESTION" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("QUESTION")}
            className={type === "QUESTION" ? "text-green-600" : ""}
          >
            <HelpCircle className="h-4 w-4" />
            Ask a question
          </Button>
          <Button
            type="button"
            variant={type === "PROJECT" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setType("PROJECT")}
            className={type === "PROJECT" ? "text-indigo-600" : ""}
          >
            <FolderKanban className="h-4 w-4" />
            Project
          </Button>
        </div>
        )}

        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {media.map((item, index) => (
            <div
              key={item.id}
              className="relative aspect-square overflow-hidden rounded-xl bg-gray-100 dark:bg-gray-800"
            >
              {item.kind === "video" ? (
                <video src={item.previewUrl} className="h-full w-full object-cover" muted playsInline />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.previewUrl} alt="" className="h-full w-full object-cover" />
              )}
              {item.status === "uploading" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/45 p-2 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
                  {typeof item.progress === "number" && item.progress > 0 && (
                    <p className="text-[10px] font-medium text-white">{item.progress}%</p>
                  )}
                </div>
              )}
              {item.status === "error" && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/60 p-2 text-center">
                  <p className="text-[10px] leading-tight text-white">{item.error || "Failed"}</p>
                  <button
                    type="button"
                    className="rounded-full bg-white/20 p-1 text-white"
                    onClick={() => retryMedia(item)}
                    aria-label="Retry upload"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {!isEditing && installVideoEligible && media.length > 1 && (
                <div className="absolute bottom-1 left-1 flex flex-col gap-0.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => globalUpload.moveItem(item.id, "up")}
                    className="rounded-full bg-black/70 p-0.5 text-white disabled:opacity-30"
                    aria-label="Move earlier"
                  >
                    <ChevronUp className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={index === media.length - 1}
                    onClick={() => globalUpload.moveItem(item.id, "down")}
                    className="rounded-full bg-black/70 p-0.5 text-white disabled:opacity-30"
                    aria-label="Move later"
                  >
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              <button
                type="button"
                onClick={() => removeMedia(item.id)}
                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                aria-label="Remove photo"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {media.length < MAX_POST_MEDIA && (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border bg-card/40 text-muted hover:border-blue-500/50 hover:text-foreground"
            >
              <ImagePlus className="h-6 w-6" />
              <span className="text-[11px] font-medium">{media.length === 0 ? "Add photo or video" : "Add more"}</span>
            </button>
          )}
        </div>

        <Textarea
          placeholder="Add a caption (optional if you added photos)..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mb-3"
        />
        {(type === "QUESTION" || type === "PROJECT") && (
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3"
          />
        )}

        {(type === "PROJECT" || type === "POST" || type === "VIDEO") && (
          <WorkDetailsFields
            open={showWorkDetails}
            onToggle={() => setShowWorkDetails((value) => !value)}
            state={work}
            onChange={(patch) => setWork((prev) => ({ ...prev, ...patch }))}
            showIntentPicker={type !== "PROJECT"}
          />
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-xs text-muted">
            {installVideoEligible && !uploading
              ? "We’ll turn these into a vertical install video — preview before you post."
              : postQueued && uploading
                ? "Uploads running — we'll publish as soon as they finish."
                : uploading
                  ? "Uploading in the background — keep browsing, or tap Post now."
                  : media.length > 0
                    ? `${readyUrls.length} of ${media.length} file${media.length === 1 ? "" : "s"} ready`
                    : "Photos are compressed on your phone. Videos up to 200MB upload over Wi‑Fi when possible."}
          </p>
          <Button
            onClick={handleSubmit}
            disabled={!canPost || installVideoPosting}
            className="min-w-24"
          >
            {pending
              ? isEditing
                ? "Saving..."
                : "Posting..."
              : installVideoPosting
                ? "Starting..."
                : postQueued && uploading
                  ? "Publishing soon..."
                  : uploading
                    ? "Post anyway"
                    : isEditing
                      ? "Save changes"
                      : installVideoEligible
                        ? "Create install video"
                        : "Post"}
          </Button>
        </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
