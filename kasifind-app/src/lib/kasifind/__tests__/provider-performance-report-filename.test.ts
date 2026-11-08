import assert from "node:assert/strict";
import test from "node:test";
import { buildProviderPerformanceReportFilename } from "../provider-performance-report-filename";

test("buildProviderPerformanceReportFilename sanitizes business name", () => {
  const name = buildProviderPerformanceReportFilename("Joe's Gates & Welding!", new Date("2026-11-08T12:00:00+02:00"));
  assert.match(name, /^KasiFind_Report_Joes_Gates_Welding_2026-11-08\.png$/);
});
