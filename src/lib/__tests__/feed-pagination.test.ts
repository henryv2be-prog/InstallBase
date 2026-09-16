import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  decodeFeedCursor,
  encodeFeedCursor,
  feedCursorWhere,
  toFeedCursor,
} from "../feed-pagination";

describe("feed-pagination", () => {
  it("round-trips feed cursors", () => {
    const cursor = toFeedCursor(
      { id: "post_1", createdAt: "2026-09-16T00:00:00.000Z" },
      ["post_1", "post_2"]
    );
    const encoded = encodeFeedCursor(cursor);
    assert.deepEqual(decodeFeedCursor(encoded), cursor);
  });

  it("returns null for invalid cursors", () => {
    assert.equal(decodeFeedCursor(""), null);
    assert.equal(decodeFeedCursor("not-valid"), null);
  });

  it("caps exclude ids carried in cursors", () => {
    const manyIds = Array.from({ length: 120 }, (_, index) => `post_${index}`);
    const cursor = toFeedCursor({ id: "post_latest", createdAt: "2026-09-16T00:00:00.000Z" }, manyIds);
    assert.equal(cursor.excludeIds?.length, 80);
    assert.equal(cursor.excludeIds?.[0], "post_40");
  });

  it("builds a descending createdAt cursor filter", () => {
    const where = feedCursorWhere({
      id: "post_b",
      createdAt: "2026-09-16T12:00:00.000Z",
    });

    assert.ok(where.OR);
    assert.equal(where.OR?.length, 2);
  });
});
