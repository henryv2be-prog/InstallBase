import { cn } from "@/lib/utils";
import { iconUrl } from "@/lib/icon-version";

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
      {/* Same asset as PWA manifest — keeps home screen and in-app logo identical */}
      <img
        src={iconUrl("icon-192.png")}
        alt=""
        width={s.icon}
        height={s.icon}
        className="shrink-0 rounded-xl"
      />
      {showText && (
        <span className={cn("hidden font-bold tracking-tight min-[380px]:inline", s.text)}>
          Install<span className="text-gradient">Base</span>
        </span>
      )}
    </div>
  );
}
