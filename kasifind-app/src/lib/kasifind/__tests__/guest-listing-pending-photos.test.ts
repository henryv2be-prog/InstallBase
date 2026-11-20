import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { countGuestPendingPhotos } from "@/lib/kasifind/guest-listing-pending-photos";

describe("countGuestPendingPhotos", () => {
  it("counts profile and work picks", () => {
    const file = new File(["x"], "a.jpg", { type: "image/jpeg" });
    assert.equal(
      countGuestPendingPhotos({ profileFile: file, workFiles: [file, file] }),
      3
    );
  });

  it("returns zero when empty", () => {
    assert.equal(countGuestPendingPhotos({ profileFile: null, workFiles: [] }), 0);
  });
});