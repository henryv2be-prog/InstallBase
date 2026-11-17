import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { uploadPathToFilename } from "@/lib/kasifind/upload-asset";

describe("listing assistance image download paths", () => {
  test("uploadPathToFilename accepts local listing paths", () => {
    assert.equal(uploadPathToFilename("/uploads/1234-photo.webp"), "1234-photo.webp");
    assert.equal(uploadPathToFilename("/uploads/nested"), null);
    assert.equal(uploadPathToFilename("https://cdn.example/x.jpg"), null);
  });
});