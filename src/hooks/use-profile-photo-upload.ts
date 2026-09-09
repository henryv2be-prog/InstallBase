"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateAvatar } from "@/lib/actions";
import { prepareMediaFile } from "@/lib/prepare-media";
import { toast } from "sonner";

export function useProfilePhotoUpload(initialImage?: string | null) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [image, setImage] = useState(initialImage ?? null);

  useEffect(() => {
    setImage(initialImage ?? null);
  }, [initialImage]);

  const openPicker = () => inputRef.current?.click();

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    startTransition(async () => {
      try {
        const prepared = await prepareMediaFile(file);
        const formData = new FormData();
        formData.append("file", prepared);
        const result = await updateAvatar(formData);
        if (result.error) {
          toast.error(result.error);
          return;
        }
        if (result.url) setImage(result.url);
        toast.success("Profile photo updated");
        router.refresh();
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not upload photo");
      }
    });
  };

  return { image, pending, inputRef, openPicker, onFileChange };
}
