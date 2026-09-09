"use client";

import { useRef, useTransition } from "react";
import { ImagePlus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { uploadAdMedia } from "@/lib/advertising/admin-actions";
import { prepareMediaFile } from "@/lib/prepare-media";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

function inferMediaType(url: string) {
  if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) return "video";
  return "image";
}

interface AdMediaUploadProps {
  mediaUrl: string;
  mediaType: string;
  onChange: (mediaUrl: string, mediaType: string) => void;
  error?: string;
}

export function AdMediaUpload({ mediaUrl, mediaType, onChange, error }: AdMediaUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const uploadFile = (file: File) => {
    startTransition(async () => {
      try {
        const prepared = await prepareMediaFile(file);
        const formData = new FormData();
        formData.append("file", prepared);
        const result = await uploadAdMedia(formData);
        if (result.error || !result.url) {
          toast.error(result.error ?? "Upload failed");
          return;
        }
        onChange(result.url, result.type ?? "image");
        toast.success("Media uploaded");
      } catch (uploadError) {
        toast.error(uploadError instanceof Error ? uploadError.message : "Could not upload media");
      }
    });
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name="mediaUrl" value={mediaUrl} />
      <input type="hidden" name="mediaType" value={mediaType} />

      {mediaUrl ? (
        <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30">
          {mediaType === "video" || /\.(mp4|webm|mov)(\?|$)/i.test(mediaUrl) ? (
            <video src={mediaUrl} className="max-h-40 w-full object-cover" controls muted playsInline />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mediaUrl} alt="Ad media preview" className="max-h-40 w-full object-cover" />
          )}
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => onChange("", "")}
            aria-label="Remove media"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif,video/mp4,video/webm"
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) uploadFile(file);
          }}
        />
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
          <ImagePlus className="h-4 w-4" />
          {pending ? "Uploading…" : "Upload image or video"}
        </Button>
      </div>

      <Input
        value={mediaUrl}
        onChange={(event) => {
          const url = event.target.value;
          onChange(url, url ? inferMediaType(url) : "");
        }}
        placeholder="Or paste a media URL (/uploads/… or https://…)"
        className={cn(error && "border-red-500")}
      />
    </div>
  );
}
