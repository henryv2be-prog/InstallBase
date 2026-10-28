import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import {
  filterReachableUploadUrls,
  localUploadExists,
  resolvePublicUploadUrl,
  uploadPathToFilename,
} from "@/lib/kasifind/upload-asset";

describe("uploadPathToFilename", () => {
  it("parses valid upload paths", () => {
    assert.equal(uploadPathToFilename("/uploads/abc.jpg"), "abc.jpg");
  });

  it("rejects traversal and nested paths", () => {
    assert.equal(uploadPathToFilename("/uploads/../x"), null);
    assert.equal(uploadPathToFilename("/uploads/a/b.jpg"), null);
  });
});

describe("localUploadExists", () => {
  let tmpDir: string;
  const prev = process.env.UPLOAD_DIR;

  before(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "kf-upload-"));
    process.env.UPLOAD_DIR = tmpDir;
    await fs.writeFile(path.join(tmpDir, "ok.webp"), "x");
  });

  after(async () => {
    process.env.UPLOAD_DIR = prev;
    await fs.rm(tmpDir, { recursive: true, force: true });
  });

  it("finds files on disk", async () => {
    assert.equal(await localUploadExists("/uploads/ok.webp"), true);
    assert.equal(await localUploadExists("/uploads/missing.webp"), false);
    assert.equal(await localUploadExists("https://cdn.example/x.jpg"), true);
  });

  it("filters and resolves urls", async () => {
    const list = await filterReachableUploadUrls(["/uploads/ok.webp", "/uploads/missing.webp"]);
    assert.deepEqual(list, ["/uploads/ok.webp"]);
    assert.equal(await resolvePublicUploadUrl("/uploads/missing.webp"), null);
    assert.equal(await resolvePublicUploadUrl("/uploads/ok.webp"), "/uploads/ok.webp");
  });
});
