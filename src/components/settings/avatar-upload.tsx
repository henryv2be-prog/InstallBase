"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useProfilePhotoUpload } from "@/hooks/use-profile-photo-upload";
import { getInitials } from "@/lib/utils";

export function AvatarUpload({
  name,
  image: initialImage,
}: {
  name?: string | null;
  image?: string | null;
}) {
  const { image, pending, inputRef, openPicker, onFileChange } = useProfilePhotoUpload(initialImage);

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="text-lg">{getInitials(name ?? "U")}</AvatarFallback>
      </Avatar>
      <div className="space-y-1">
        <input
          ref={inputRef}
          type="file"
          accept="image/*,.heic,.heif"
          className="sr-only"
          onChange={onFileChange}
        />
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={openPicker}>
          {pending ? "Uploading..." : image ? "Change photo" : "Add profile photo"}
        </Button>
        <p className="text-xs text-muted">JPG, PNG, or HEIC. Shown on your profile and posts.</p>
      </div>
    </div>
  );
}
