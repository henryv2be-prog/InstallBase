"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, Video, Trophy, HelpCircle, FolderKanban } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createPost, uploadImage } from "@/lib/actions";
import { toast } from "sonner";
import type { PostType } from "@/generated/prisma/client";

const postTypes: { type: PostType; label: string; icon: React.ReactNode; color: string }[] = [
  { type: "POST", label: "Photo", icon: <Camera className="h-4 w-4" />, color: "text-blue-600" },
  { type: "VIDEO", label: "Video", icon: <Video className="h-4 w-4" />, color: "text-purple-600" },
  { type: "BRAG", label: "Brag", icon: <Trophy className="h-4 w-4" />, color: "text-orange-600" },
  { type: "QUESTION", label: "Ask", icon: <HelpCircle className="h-4 w-4" />, color: "text-green-600" },
  { type: "PROJECT", label: "Project", icon: <FolderKanban className="h-4 w-4" />, color: "text-indigo-600" },
];

interface CreatePostCardProps {
  userName?: string | null;
  userImage?: string | null;
  compact?: boolean;
}

export function CreatePostCard({ userName, compact }: CreatePostCardProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [expanded, setExpanded] = useState(!compact);
  const [type, setType] = useState<PostType>("POST");
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [bragStats, setBragStats] = useState({ cameras: "", nvrs: "", fibre: "", storage: "" });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const result = await uploadImage(formData);
        if (result.error) {
          toast.error(result.error);
        } else if (result.url) {
          setMediaUrls((prev) => [...prev, result.url!]);
        }
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleSubmit = () => {
    if (!content.trim()) {
      toast.error("Write something first");
      return;
    }
    startTransition(async () => {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("content", content);
      if (title) formData.append("title", title);
      if (location) formData.append("location", location);
      mediaUrls.forEach((url) => formData.append("mediaUrls", url));
      if (type === "BRAG") {
        formData.append("bragDetails", JSON.stringify(bragStats));
      }
      try {
        await createPost(formData);
        toast.success("Posted!");
        setContent("");
        setTitle("");
        setMediaUrls([]);
        setExpanded(false);
        router.refresh();
      } catch {
        toast.error("Failed to create post");
      }
    });
  };

  if (compact && !expanded) {
    return (
      <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setExpanded(true)}>
        <CardContent className="p-4">
          <p className="text-gray-500">
            What&apos;s happening on your install, {userName?.split(" ")[0] ?? "installer"}?
          </p>
          <div className="mt-3 flex gap-2">
            {postTypes.map((pt) => (
              <span key={pt.type} className={`flex items-center gap-1 text-sm ${pt.color}`}>
                {pt.icon} {pt.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-5">
        <h2 className="mb-3 font-semibold text-gray-900 dark:text-white">
          What&apos;s happening on your install?
        </h2>
        <Textarea
          placeholder="Share an installation, ask a question, or show us what you're working on..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          className="mb-3"
        />
        {(type === "BRAG" || type === "QUESTION" || type === "PROJECT") && (
          <Input
            placeholder="Title (optional)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-3"
          />
        )}
        <Input
          placeholder="Location (optional)"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mb-3"
        />
        {type === "BRAG" && (
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Input placeholder="Cameras" value={bragStats.cameras} onChange={(e) => setBragStats({ ...bragStats, cameras: e.target.value })} />
            <Input placeholder="NVRs" value={bragStats.nvrs} onChange={(e) => setBragStats({ ...bragStats, nvrs: e.target.value })} />
            <Input placeholder="Fibre" value={bragStats.fibre} onChange={(e) => setBragStats({ ...bragStats, fibre: e.target.value })} />
            <Input placeholder="Storage" value={bragStats.storage} onChange={(e) => setBragStats({ ...bragStats, storage: e.target.value })} />
          </div>
        )}
        {mediaUrls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {mediaUrls.map((url, i) => (
              <span key={i} className="rounded-lg bg-gray-100 px-2 py-1 text-xs dark:bg-gray-800">
                Image {i + 1} uploaded
              </span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1">
            {postTypes.map((pt) => (
              <Button
                key={pt.type}
                variant={type === pt.type ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setType(pt.type)}
                className={type === pt.type ? pt.color : ""}
              >
                {pt.icon}
                {pt.label}
              </Button>
            ))}
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="ghost" size="sm" asChild>
                <span>{uploading ? "Uploading..." : type === "VIDEO" ? "🎥 Video" : "📸 Upload"}</span>
              </Button>
            </label>
          </div>
          <Button onClick={handleSubmit} disabled={pending || uploading}>
            {pending ? "Posting..." : "Post"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

