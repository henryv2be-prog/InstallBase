import Image from "next/image";
import { cn } from "@/lib/utils";
import { isLocalUpload } from "@/lib/uploads";

interface MediaImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
}

export function MediaImage({ src, alt, fill, className, sizes }: MediaImageProps) {
  if (isLocalUpload(src)) {
    return (
      // User uploads are served from /data via route handler — skip next/image optimization
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={cn(fill && "absolute inset-0 h-full w-full object-cover", className)}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
    />
  );
}
