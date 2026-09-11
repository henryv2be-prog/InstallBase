"use client";

import { Camera } from "lucide-react";
import { PresenceAvatar } from "@/components/presence/presence-avatar";
import { useProfilePhotoUpload } from "@/hooks/use-profile-photo-upload";
import { cn } from "@/lib/utils";

interface EditableProfileAvatarProps {
  name?: string | null;
  image?: string | null;
  lastSeenAt?: Date | string | null;
  editable?: boolean;
  className?: string;
  fallbackClassName?: string;
  wrapperClassName?: string;
  ringClassName?: string;
}

export function EditableProfileAvatar({
  name,
  image: initialImage,
  lastSeenAt,
  editable = false,
  className,
  fallbackClassName,
  wrapperClassName,
  ringClassName,
}: EditableProfileAvatarProps) {
  const { image, pending, inputRef, openPicker, onFileChange } = useProfilePhotoUpload(initialImage);
  const hasPhoto = Boolean(image);

  if (!editable) {
    return (
      <PresenceAvatar
        src={image}
        name={name}
        lastSeenAt={lastSeenAt}
        size="lg"
        wrapperClassName={wrapperClassName}
        className={className}
        fallbackClassName={fallbackClassName}
        ringClassName={ringClassName}
      />
    );
  }

  return (
    <div className={cn("relative inline-flex shrink-0", wrapperClassName)}>
      <button
        type="button"
        onClick={openPicker}
        disabled={pending}
        className="group relative rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-70"
        aria-label={hasPhoto ? "Change profile photo" : "Add profile photo"}
      >
        <PresenceAvatar
          src={image}
          name={name}
          lastSeenAt={lastSeenAt}
          size="lg"
          className={className}
          fallbackClassName={fallbackClassName}
          ringClassName={ringClassName}
        />
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-white transition-opacity",
            hasPhoto ? "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100" : "opacity-100"
          )}
        >
          <Camera className="h-6 w-6" />
        </span>
        {!hasPhoto && (
          <span className="pointer-events-none absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
            Add photo
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.heic,.heif"
        className="sr-only"
        onChange={onFileChange}
      />
      {pending && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-full bg-black/30">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
        </span>
      )}
    </div>
  );
}
