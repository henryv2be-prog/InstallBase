export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  const { startVideoCompilationScheduler } = await import("@/lib/video-compilation/queue");
  startVideoCompilationScheduler();

  const { isAutoRunEnabled, startReengagementScheduler } = await import(
    "@/lib/reengagement/scheduler"
  );

  if (!isAutoRunEnabled()) return;

  startReengagementScheduler();
}
