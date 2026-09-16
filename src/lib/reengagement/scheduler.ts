import "server-only";
import {
  isAutoRunEnabled,
  markSchedulerRunComplete,
  shouldRunScheduledJob,
} from "./scheduler-shared";

export { isAutoRunEnabled, shouldRunScheduledJob, markSchedulerRunComplete } from "./scheduler-shared";

const TICK_MS = 60_000;
const GLOBAL_KEY = "__installbaseReengagementScheduler";

type SchedulerState = {
  started: boolean;
  lastRunDate: string | null;
  running: boolean;
};

function getState(): SchedulerState {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: SchedulerState };
  if (!g[GLOBAL_KEY]) {
    g[GLOBAL_KEY] = { started: false, lastRunDate: null, running: false };
  }
  return g[GLOBAL_KEY]!;
}

async function tick(state: SchedulerState) {
  if (state.running) return;

  const now = new Date();
  const { run, today } = shouldRunScheduledJob(now, state.lastRunDate);
  if (!run) return;

  state.running = true;
  try {
    const { runDailyReengagement } = await import("./send");
    const result = await runDailyReengagement({ now });
    const completed = markSchedulerRunComplete(result, today);
    if (completed) state.lastRunDate = completed;

    if (result.sent > 0) {
      console.info(
        `[reengagement] Daily digest sent to ${result.sent} user(s); skipped:`,
        result.skippedUsers
      );
    } else if (result.skipped) {
      console.info(`[reengagement] Daily digest skipped: ${result.skipped}`);
    }
  } catch (error) {
    console.error("[reengagement] Scheduled run failed:", error);
  } finally {
    state.running = false;
  }
}

export function startReengagementScheduler() {
  if (!isAutoRunEnabled()) return;

  const state = getState();
  if (state.started) return;
  state.started = true;

  console.info("[reengagement] Auto-run scheduler enabled");

  const runTick = () => {
    void tick(state);
  };

  runTick();
  setInterval(runTick, TICK_MS);
}
