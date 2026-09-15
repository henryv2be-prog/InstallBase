import { cn } from "@/lib/utils";
import { AppIconImage } from "@/components/ui/app-icon-image";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { icon: 32, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 44, text: "text-xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <AppIconImage size={s.icon} className="shadow-lg btn-glow" />
      {showText && (
        <span className={cn("hidden font-bold tracking-tight min-[380px]:inline", s.text)}>
          Install<span className="text-gradient">Base</span>
        </span>
      )}
    </div>
  );
}
