import Image from "next/image";
import { cn } from "@/lib/utils";

interface AppIconImageProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** InstallBase app icon — same asset used for favicon, PWA, and notifications. */
export function AppIconImage({ size = 36, className, priority = false }: AppIconImageProps) {
  return (
    <Image
      src="/icons/icon-192.png"
      alt=""
      width={size}
      height={size}
      priority={priority}
      className={cn("rounded-xl object-cover", className)}
      sizes={`${size}px`}
    />
  );
}
