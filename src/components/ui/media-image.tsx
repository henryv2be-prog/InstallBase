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
  const skipOptimizer =
    isLocalUpload(src) || src.startsWith("https://images.unsplash.com/");

  if (skipOptimizer) {
    return (
      // User uploads and Unsplash are served directly — skip next/image (Railway OOM)
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
