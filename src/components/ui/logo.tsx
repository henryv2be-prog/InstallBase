import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

const sizes = {
  sm: { box: "h-8 w-8 text-xs", text: "text-base" },
  md: { box: "h-9 w-9 text-sm", text: "text-lg" },
  lg: { box: "h-11 w-11 text-base", text: "text-xl" },
};

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const s = sizes[size];
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 font-bold text-white shadow-lg btn-glow",
          s.box
        )}
      >
        <span className="relative z-10 font-mono">IB</span>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight", s.text)}>
          Install<span className="text-gradient">Base</span>
        </span>
      )}
    </div>
  );
}
