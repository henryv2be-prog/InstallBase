import { AppIcon } from "@/components/ui/app-icon";

interface AppIconImageProps {
  size?: number;
  className?: string;
  priority?: boolean;
}

/** @deprecated Use AppIcon directly. Kept for compatibility — renders inline SVG, not a raster. */
export function AppIconImage({ size = 36, className }: AppIconImageProps) {
  return <AppIcon size={size} className={className} />;
}
