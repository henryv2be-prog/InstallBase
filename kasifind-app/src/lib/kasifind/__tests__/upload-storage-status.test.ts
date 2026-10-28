import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { uploadStorageWarnings } from "@/lib/kasifind/upload-storage-status";

describe("uploadStorageWarnings", () => {
  it("warns when UPLOAD_DIR is unset", () => {
    const warnings = uploadStorageWarnings("/workspace/public/uploads", false);
    assert.ok(warnings.some((w) => w.includes("UPLOAD_DIR")));
  });

  it("warns when path looks like Postgres data", () => {
    const warnings = uploadStorageWarnings("/var/lib/postgresql/data", true);
    assert.ok(warnings.some((w) => w.includes("Postgres")));
  });
});
