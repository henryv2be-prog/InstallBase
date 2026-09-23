"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createPost, updatePost } from "@/lib/actions";
import { uploadMediaFile } from "@/lib/client-upload";
import { MAX_POST_MEDIA, prepareMediaFile } from "@/lib/prepare-media";
import { formatUploadLimit, maxBytesForUpload } from "@/lib/upload-limits";
import type { PostType } from "@/generated/prisma/client";
import type { WorkDetailsFormState } from "@/components/feed/work-details-fields";

export type MediaUploadItem = {
  id: string;
  previewUrl: string;
  serverUrl?: string;
  kind: "image" | "video";
  status: "uploading" | "ready" | "error";
  progress?: number;
  error?: string;
  label: string;
};

export type PendingPostPayload = {
  type: PostType;
  content: string;
  title: string;
  work: WorkDetailsFormState;
  editPostId?: string;
};

type MediaUploadContextValue = {
  items: MediaUploadItem[];
  postQueued: boolean;
  isSubmitting: boolean;
  isUploading: boolean;
  readyUrls: string[];
  failedCount: number;
  addFiles: (files: FileList | File[]) => void;
  removeItem: (id: string) => void;
  moveItem: (id: string, direction: "up" | "down") => void;
  retryItem: (id: string) => void;
  clearItems: () => void;
  seedReadyMedia: (entries: { url: string; kind: "image" | "video" }[]) => void;
  queuePost: (payload: PendingPostPayload) => void;
  cancelQueuedPost: () => void;
  submitNow: (payload: PendingPostPayload) => void;
};

const MediaUploadContext = createContext<MediaUploadContextValue | null>(null);

function isVideoFile(file: File) {
  return file.type.startsWith("video/") || /\.(mp4|webm|mov)$/i.test(file.name);
}

function buildFormData(payload: PendingPostPayload, mediaUrls: string[]) {
  const formData = new FormData();
  if (payload.editPostId) formData.append("postId", payload.editPostId);
  else formData.append("type", payload.type);
  formData.append("content", payload.content);
  if (payload.title) formData.append("title", payload.title);
  formData.append("postIntent", payload.work.postIntent);
  formData.append("showExactLocation", payload.work.showExactLocation ? "true" : "false");
  if (payload.work.location.trim()) formData.append("location", payload.work.location.trim());
  if (payload.work.workTrade) formData.append("workTrade", payload.work.workTrade);
  if (payload.work.workProjectType) formData.append("workProjectType", payload.work.workProjectType);
  if (payload.work.workDeviceCount) formData.append("workDeviceCount", payload.work.workDeviceCount);
  if (payload.work.workDate) formData.append("workDate", payload.work.workDate);
  if (payload.work.workEquipmentNotes) {
    formData.append("workEquipmentNotes", payload.work.workEquipmentNotes);
  }
  mediaUrls.forEach((url) => formData.append("mediaUrls", url));
  return formData;
}

export function MediaUploadProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [items, setItems] = useState<MediaUploadItem[]>([]);
  const [postQueued, setPostQueued] = useState(false);
  const [pendingPost, setPendingPost] = useState<PendingPostPayload | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const filesRef = useRef<Map<string, File>>(new Map());
  const itemsRef = useRef(items);
  itemsRef.current = items;

  const isUploading = items.some((item) => item.status === "uploading");
  const failedCount = items.filter((item) => item.status === "error").length;
  const readyUrls = items
    .filter((item) => item.status === "ready" && item.serverUrl)
    .map((item) => item.serverUrl!);

  const revokePreview = useCallback((previewUrl: string) => {
    if (previewUrl.startsWith("blob:")) URL.revokeObjectURL(previewUrl);
  }, []);

  const runUpload = useCallback(async (id: string, file: File) => {
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
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, progress } : item)));
      });

      if ("error" in result) throw new Error(result.error);

      setItems((prev) =>
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
      filesRef.current.delete(id);
    } catch (error) {
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : item
        )
      );
    }
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList);
      if (incoming.length === 0) return;

      const room = MAX_POST_MEDIA - itemsRef.current.length;
      if (room <= 0) {
        toast.error(`You can add up to ${MAX_POST_MEDIA} photos`);
        return;
      }

      const chosen = incoming.slice(0, room);
      if (incoming.length > room) {
        toast.error(`Added ${room} of ${incoming.length} — ${MAX_POST_MEDIA} photo limit`);
      }

      const next: MediaUploadItem[] = chosen.map((file) => ({
        id: crypto.randomUUID(),
        previewUrl: URL.createObjectURL(file),
        kind: isVideoFile(file) ? "video" : "image",
        status: "uploading",
        progress: 0,
        label: file.name || (isVideoFile(file) ? "Video" : "Photo"),
      }));

      setItems((prev) => [...prev, ...next]);
      for (const [index, item] of next.entries()) {
        filesRef.current.set(item.id, chosen[index]);
        void runUpload(item.id, chosen[index]);
      }
    },
    [runUpload]
  );

  const removeItem = useCallback(
    (id: string) => {
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (item) revokePreview(item.previewUrl);
      filesRef.current.delete(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
    },
    [revokePreview]
  );

  const moveItem = useCallback((id: string, direction: "up" | "down") => {
    setItems((prev) => {
      const index = prev.findIndex((entry) => entry.id === id);
      if (index < 0) return prev;
      const target = direction === "up" ? index - 1 : index + 1;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      const [row] = next.splice(index, 1);
      next.splice(target, 0, row);
      return next;
    });
  }, []);

  const retryItem = useCallback(
    (id: string) => {
      const file = filesRef.current.get(id);
      const item = itemsRef.current.find((entry) => entry.id === id);
      if (!file || !item) {
        toast.error("Choose the file again to retry");
        return;
      }
      setItems((prev) =>
        prev.map((entry) =>
          entry.id === id ? { ...entry, status: "uploading", error: undefined, progress: 0 } : entry
        )
      );
      void runUpload(id, file);
    },
    [runUpload]
  );

  const clearItems = useCallback(() => {
    for (const item of itemsRef.current) revokePreview(item.previewUrl);
    filesRef.current.clear();
    setItems([]);
  }, [revokePreview]);

  const seedReadyMedia = useCallback((entries: { url: string; kind: "image" | "video" }[]) => {
    if (entries.length === 0 || itemsRef.current.length > 0) return;
    setItems(
      entries.map((entry) => ({
        id: crypto.randomUUID(),
        previewUrl: entry.url,
        serverUrl: entry.url,
        kind: entry.kind,
        status: "ready" as const,
        label: entry.kind === "video" ? "Video" : "Photo",
      }))
    );
  }, []);

  const cancelQueuedPost = useCallback(() => {
    setPostQueued(false);
    setPendingPost(null);
  }, []);

  const executePost = useCallback(
    async (payload: PendingPostPayload) => {
      const urls = itemsRef.current
        .filter((item) => item.status === "ready" && item.serverUrl)
        .map((item) => item.serverUrl!);
      const failed = itemsRef.current.filter((item) => item.status === "error").length;

      if (!payload.content.trim() && urls.length === 0) {
        toast.error("Add a photo or write something first");
        return;
      }

      setIsSubmitting(true);
      try {
        const formData = buildFormData(payload, urls);
        const result = payload.editPostId ? await updatePost(formData) : await createPost(formData);
        if (result && "error" in result && result.error) {
          toast.error(result.error);
          return;
        }

        toast.success(
          payload.editPostId
            ? "Post updated"
            : failed
              ? "Posted — some photos didn’t upload"
              : "Posted!"
        );

        clearItems();
        setPostQueued(false);
        setPendingPost(null);
        if (!payload.editPostId && typeof window !== "undefined") {
          sessionStorage.removeItem("ib-create-draft-v4");
        }

        const postId = result && "postId" in result ? result.postId : payload.editPostId;
        if (payload.editPostId && postId) {
          router.push(`/post/${postId}`);
        } else {
          router.push("/feed/watch?tab=popular");
        }
        router.refresh();
      } catch {
        toast.error(payload.editPostId ? "Failed to update post" : "Failed to create post");
      } finally {
        setIsSubmitting(false);
      }
    },
    [clearItems, router]
  );

  const submitNow = useCallback(
    (payload: PendingPostPayload) => {
      if (isUploading) {
        setPendingPost(payload);
        setPostQueued(true);
        toast.info("Publishing when uploads finish…");
        return;
      }
      void executePost(payload);
    },
    [executePost, isUploading]
  );

  const queuePost = useCallback((payload: PendingPostPayload) => {
    setPendingPost(payload);
    setPostQueued(true);
    toast.info("Publishing when uploads finish…");
  }, []);

  useEffect(() => {
    if (!postQueued || !pendingPost || isUploading || isSubmitting) return;
    if (failedCount > 0) {
      setPostQueued(false);
      toast.error("Remove or retry failed uploads before posting");
      return;
    }
    void executePost(pendingPost);
  }, [postQueued, pendingPost, isUploading, isSubmitting, failedCount, readyUrls.length, executePost]);

  const value = useMemo(
    () => ({
      items,
      postQueued,
      isSubmitting,
      isUploading,
      readyUrls,
      failedCount,
      addFiles,
      removeItem,
      moveItem,
      retryItem,
      clearItems,
      seedReadyMedia,
      queuePost,
      cancelQueuedPost,
      submitNow,
    }),
    [
      items,
      postQueued,
      isSubmitting,
      isUploading,
      readyUrls,
      failedCount,
      addFiles,
      removeItem,
      moveItem,
      retryItem,
      clearItems,
      seedReadyMedia,
      queuePost,
      cancelQueuedPost,
      submitNow,
    ]
  );

  return <MediaUploadContext.Provider value={value}>{children}</MediaUploadContext.Provider>;
}

export function useMediaUpload() {
  const context = useContext(MediaUploadContext);
  if (!context) {
    throw new Error("useMediaUpload must be used within MediaUploadProvider");
  }
  return context;
}

export function useMediaUploadOptional() {
  return useContext(MediaUploadContext);
}
