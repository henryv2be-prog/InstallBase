import { cn } from "@/lib/utils";

/** Full-height create/edit composer — no page scroll; content fits --create-flow-h. */
export function CreateFlowViewport({
  children,
  title,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "create-flow-root flex max-h-[var(--create-flow-h)] min-h-0 w-full flex-col overflow-hidden",
        className
      )}
    >
      {title ? (
        <h1 className="shrink-0 px-0.5 pb-2 text-lg font-bold leading-tight sm:text-xl">{title}</h1>
      ) : null}
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
