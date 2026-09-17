"use client";

import type { ReactNode } from "react";
import { MediaUploadProvider } from "@/components/feed/media-upload-context";

export function AppProviders({ children, signedIn }: { children: ReactNode; signedIn: boolean }) {
  if (!signedIn) return children;
  return <MediaUploadProvider>{children}</MediaUploadProvider>;
}
