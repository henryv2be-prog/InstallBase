import { cn } from "@/lib/utils";
import { IB_MARK_BOX_CLASS, IbMark } from "@/components/ui/ib-mark";

interface AppBrandIconProps {
  size?: number;
  className?: string;
}

/** Crisp in-app icon — SVG mark on brand gradient (avoids PNG scaling artifacts). */
export function AppBrandIcon({ size = 36, className }: AppBrandIconProps) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-700 to-cyan-500 text-white",
        className
      )}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <IbMark className={IB_MARK_BOX_CLASS} />
    </span>
  );
}
