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
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost, uploadImage } from "@/lib/actions";
import { MAX_POST_MEDIA, prepareMediaFile } from "@/lib/prepare-media";
import { formatUploadLimit, maxBytesForUpload } from "@/lib/upload-limits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { PostType } from "@/generated/prisma/client";
import {
  WorkDetailsFields,
  type WorkDetailsFormState,
} from "@/components/feed/work-details-fields";

const DRAFT_KEY = "ib-create-draft-v4";

type MediaItem = {
  id: string;
  previewUrl: string;
  serverUrl?: string;
  kind: "image" | "video";
  status: "uploading" | "ready" | "error";
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

interface CreatePostCardProps {
  userName?: string | null;
  userImage?: string | null;
  compact?: boolean;
}

export function CreatePostCard({ userName, compact }: CreatePostCardProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(!compact);
  const [type, setType] = useState<PostType>("POST");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [work, setWork] = useState<WorkDetailsFormState>(defaultWorkState);
  const [showWorkDetails, setShowWorkDetails] = useState(false);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const mediaRef = useRef(media);
  mediaRef.current = media;

  useEffect(() => {
    const draft = readDraft();
    if (draft) {
      setType(draft.type === "BRAG" ? "POST" : draft.type);
      setContent(draft.content);
      setTitle(draft.title);
      setWork(draft.work ?? defaultWorkState());
      setShowWorkDetails(draft.showWorkDetails ?? false);
      setMedia(
        draft.media.map((item) => ({
          id: crypto.randomUUID(),
          previewUrl: item.url,
          serverUrl: item.url,
          kind: item.kind,
          status: "ready",
        }))
      );
      if (compact) setExpanded(true);
    }
    setHydrated(true);
  }, [compact]);

  useEffect(() => {
    if (!hydrated) return;
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
  }, [hydrated, type, content, title, work, showWorkDetails, media]);

  useEffect(() => {
    if (type === "PROJECT") {
      setWork((prev) => ({ ...prev, postIntent: "PROJECT_INSTALLATION" }));
    } else if (type === "QUESTION") {
      setWork((prev) => ({ ...prev, postIntent: "GENERAL" }));
    }
  }, [type]);

  useEffect(() => {
    return () => {
      for (const item of mediaRef.current) {
        if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      }
    };
  }, []);

  const uploading = media.some((item) => item.status === "uploading");
  const readyUrls = media.filter((item) => item.status === "ready" && item.serverUrl).map((item) => item.serverUrl!);
  const canPost = (content.trim().length > 0 || readyUrls.length > 0) && !uploading && !pending;

  const uploadFile = async (id: string, file: File) => {
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
      const formData = new FormData();
      formData.append("file", prepared);
      const result = await uploadImage(formData);
      if (result.error) throw new Error(result.error);
      setMedia((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "ready",
                serverUrl: result.url,
                kind: result.type === "video" ? "video" : "image",
                error: undefined,
              }
            : item
        )
      );
    } catch (error) {
      setMedia((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, status: "error", error: error instanceof Error ? error.message : "Upload failed" }
            : item
        )
      );
    }
  };

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    if (incoming.length === 0) return;
    const room = MAX_POST_MEDIA - media.length;
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

    setMedia((prev) => [...prev, ...next]);
    setExpanded(true);
    for (const [index, item] of next.entries()) {
      void uploadFile(item.id, chosen[index]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;
    addFiles(files);
    e.target.value = "";
  };

  const removeMedia = (id: string) => {
    setMedia((prev) => {
      const item = prev.find((m) => m.id === id);
      if (item?.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
      return prev.filter((m) => m.id !== id);
    });
  };

  const retryMedia = (item: MediaItem) => {
    if (!item.previewUrl.startsWith("blob:")) {
      toast.error("Choose the photo again to retry");
      fileRef.current?.click();
      return;
    }
    setMedia((prev) => prev.map((m) => (m.id === item.id ? { ...m, status: "uploading", error: undefined } : m)));
    void fetch(item.previewUrl)
      .then((res) => res.blob())
      .then((blob) => uploadFile(item.id, new File([blob], "photo.jpg", { type: blob.type || "image/jpeg" })));
  };

  const resetComposer = () => {
    for (const item of media) {
      if (item.previewUrl.startsWith("blob:")) URL.revokeObjectURL(item.previewUrl);
    }
    setContent("");
    setTitle("");
    setWork(defaultWorkState());
    setShowWorkDetails(false);
    setMedia([]);
    setType("POST");
    clearDraft();
    if (compact) setExpanded(false);
  };

  const handleSubmit = () => {
    if (uploading) {
      toast.error("Wait for photos to finish uploading");
      return;
    }
    if (!content.trim() && readyUrls.length === 0) {
      toast.error("Add a photo or write something first");
      return;
    }
    const failed = media.filter((item) => item.status === "error").length;
    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", type);
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
        const result = await createPost(formData);
        if (result && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }
        toast.success(failed ? "Posted — some photos didn’t upload" : "Posted!");
        const postId = result && "postId" in result ? result.postId : undefined;
        resetComposer();
        if (postId) router.push(`/post/${postId}`);
        else router.push("/feed");
        router.refresh();
      } catch {
        toast.error("Failed to create post");
      }
    });
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

  if (compact && !expanded) {
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
          What&apos;s happening on your install?
        </h2>

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

        <div className="mb-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {media.map((item) => (
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
                <div className="absolute inset-0 flex items-center justify-center bg-black/45">
                  <Loader2 className="h-6 w-6 animate-spin text-white" />
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
            {uploading
              ? "Uploading photos — they’ll stay in your draft if you switch screens."
              : media.length > 0
                ? `${readyUrls.length} photo${readyUrls.length === 1 ? "" : "s"} ready`
                : "Photos are compressed on your phone so they don’t get dropped."}
          </p>
          <Button onClick={handleSubmit} disabled={!canPost} className="min-w-24">
            {pending ? "Posting..." : uploading ? "Uploading..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
