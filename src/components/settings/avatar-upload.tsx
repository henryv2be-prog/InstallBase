"use client";

import { useRef, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateAvatar } from "@/lib/actions";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";

export function AvatarUpload({
  name,
  image,
}: {
  name?: string | null;
  image?: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await updateAvatar(formData);
      if (result.error) toast.error(result.error);
      else toast.success("Profile photo updated");
    });
    e.target.value = "";
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16">
        <AvatarImage src={image ?? undefined} />
        <AvatarFallback className="text-lg">{getInitials(name ?? "U")}</AvatarFallback>
      </Avatar>
      <div>
        <input ref={inputRef} type="file" accept="image/*" className="sr-only" onChange={handleChange} />
        <Button type="button" variant="outline" size="sm" disabled={pending} onClick={() => inputRef.current?.click()}>
          {pending ? "Uploading..." : "Change photo"}
        </Button>
      </div>
    </div>
  );
}
