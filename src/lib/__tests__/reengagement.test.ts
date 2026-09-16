import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { buildReengagementContent } from "../reengagement/content";
import { hasMeaningfulActivity, totalActivityCount, type CommunityActivity } from "../reengagement/activity-shared";
import {
  alreadySentToday,
  isEligibleForReengagement,
  wasActiveToday,
} from "../reengagement/eligibility";
import {
  calendarDateInTimezone,
  getReengagementConfig,
  startOfCalendarDay,
} from "../reengagement/config";

function activity(overrides: Partial<CommunityActivity> = {}): CommunityActivity {
  return {
    since: new Date("2026-09-15T00:00:00Z"),
    posts: 0,
    installations: 0,
    questions: 0,
    answers: 0,
    bragPoints: 0,
    highlight: null,
    ...overrides,
  };
}

describe("reengagement content", () => {
  it("returns null when there is no activity", () => {
    assert.equal(buildReengagementContent(activity()), null);
  });

  it("builds a stats digest for multiple activity types", () => {
    const content = buildReengagementContent(
      activity({ posts: 4, questions: 2, bragPoints: 17 }),
      3
    );
    assert.ok(content);
    assert.match(content!.body, /4 new posts/);
    assert.match(content!.body, /2 questions/);
    assert.match(content!.body, /17 Brag points/);
    assert.equal(content!.url, "/feed?ref=daily-reengagement");
  });

  it("highlights a single installation post", () => {
    const content = buildReengagementContent(
      activity({
        installations: 1,
        highlight: {
          id: "post-1",
          title: null,
          content: "New access control install at a warehouse",
          type: "POST",
          postIntent: "PROJECT_INSTALLATION",
        },
      }),
      1
    );
    assert.ok(content);
    assert.match(content!.body, /access control installation/i);
    assert.equal(content!.url, "/post/post-1?ref=daily-reengagement");
  });

  it("varies title copy by seed", () => {
    const a = buildReengagementContent(activity({ posts: 2 }), 1);
    const b = buildReengagementContent(activity({ posts: 2 }), 2);
    assert.notEqual(a!.title, b!.title);
  });
});

describe("reengagement eligibility", () => {
  const config = getReengagementConfig();

  it("skips users who were active today", () => {
    const now = new Date("2026-09-16T12:00:00Z");
    const dayStart = startOfCalendarDay(now, "UTC");
    assert.equal(
      wasActiveToday(new Date(dayStart.getTime() + 60_000), now, "UTC"),
      true
    );
    const result = isEligibleForReengagement(
      {
        id: "u1",
        lastSeenAt: new Date(dayStart.getTime() + 60_000),
        lastDailyReengagementAt: null,
      },
      now,
      config
    );
    assert.equal(result.eligible, false);
    assert.equal(result.reason, "active_today");
  });

  it("skips users who already received today's digest", () => {
    const now = new Date("2026-09-16T12:00:00Z");
    const dayStart = startOfCalendarDay(now, "UTC");
    assert.equal(
      alreadySentToday(new Date(dayStart.getTime() + 60_000), now, "UTC"),
      true
    );
    const result = isEligibleForReengagement(
      {
        id: "u1",
        lastSeenAt: null,
        lastDailyReengagementAt: new Date(dayStart.getTime() + 60_000),
      },
      now,
      config
    );
    assert.equal(result.eligible, false);
    assert.equal(result.reason, "already_sent_today");
  });

  it("allows inactive users who have not received today", () => {
    const now = new Date("2026-09-16T12:00:00Z");
    const result = isEligibleForReengagement(
      {
        id: "u1",
        lastSeenAt: new Date("2026-09-14T12:00:00Z"),
        lastDailyReengagementAt: new Date("2026-09-14T12:00:00Z"),
      },
      now,
      config
    );
    assert.equal(result.eligible, true);
  });
});

describe("reengagement activity thresholds", () => {
  it("requires meaningful activity before sending", () => {
    assert.equal(hasMeaningfulActivity(activity(), 1), false);
    assert.equal(hasMeaningfulActivity(activity({ questions: 1 }), 1), true);
    assert.equal(totalActivityCount(activity({ posts: 2, bragPoints: 3 })), 5);
  });
});

describe("reengagement calendar helpers", () => {
  it("formats calendar dates in UTC", () => {
    const date = new Date("2026-09-16T15:30:00Z");
    assert.equal(calendarDateInTimezone(date, "UTC"), "2026-09-16");
  });

  it("finds start of calendar day in UTC", () => {
    const date = new Date("2026-09-16T15:30:00Z");
    const start = startOfCalendarDay(date, "UTC");
    assert.equal(start.toISOString(), "2026-09-16T00:00:00.000Z");
  });
});
