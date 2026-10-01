import { cn } from "@/lib/utils";

/** Consistent width + spacing for non-feed app pages on mobile (matches New look chrome). */
export function MobileAppPage({
  children,
  className,
  wide,
}: {
  children: React.ReactNode;
  className?: string;
  wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "app-scroll-page mx-auto w-full animate-fade-in max-md:px-1",
        wide ? "max-w-2xl" : "max-w-2xl",
        className
      )}
    >
      {children}
    </div>
  );
}
