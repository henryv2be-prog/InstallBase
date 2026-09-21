export async function register() {
  if (process.env.NEXT_RUNTIME === "edge") return;

  // Grade 12 Study Coach deploy — no install-video compilation worker.
  const { isAutoRunEnabled, startReengagementScheduler } = await import(
    "@/lib/reengagement/scheduler"
  );

  if (!isAutoRunEnabled()) return;

  startReengagementScheduler();
}
