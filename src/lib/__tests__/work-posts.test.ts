import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  getPostTradeLabel,
  isPortfolioPost,
  resolveComposerIntent,
  shouldIncludeInPortfolio,
  shouldShowPostLocation,
} from "../work-posts";

describe("work-posts", () => {
  it("resolves composer intent from post type", () => {
    assert.equal(resolveComposerIntent("PROJECT", null), "PROJECT_INSTALLATION");
    assert.equal(resolveComposerIntent("POST", "SERVICE_REPAIR"), "SERVICE_REPAIR");
  });

  it("detects portfolio posts", () => {
    assert.equal(
      isPortfolioPost({ type: "POST", postIntent: "GENERAL", inPortfolio: false }),
      false
    );
    assert.equal(
      isPortfolioPost({ type: "PROJECT", postIntent: "GENERAL", inPortfolio: false }),
      true
    );
    assert.equal(
      isPortfolioPost({ type: "POST", postIntent: "SERVICE_REPAIR", inPortfolio: false }),
      true
    );
  });

  it("includes portfolio when intent or legacy project type matches", () => {
    assert.equal(shouldIncludeInPortfolio("PROJECT", "GENERAL"), true);
    assert.equal(shouldIncludeInPortfolio("POST", "PROJECT_INSTALLATION"), true);
    assert.equal(shouldIncludeInPortfolio("POST", "GENERAL"), false);
  });

  it("groups trade labels from categories and work details", () => {
    assert.equal(
      getPostTradeLabel({
        categories: [{ category: { name: "Access Control" } }],
      }),
      "Access Control"
    );
    assert.equal(
      getPostTradeLabel({ workDetails: { trade: "CCTV" } }),
      "CCTV"
    );
  });

  it("hides exact work locations unless explicitly enabled", () => {
    assert.equal(
      shouldShowPostLocation({
        location: "123 Main Street",
        showExactLocation: false,
        postIntent: "PROJECT_INSTALLATION",
        type: "POST",
      }),
      false
    );
    assert.equal(
      shouldShowPostLocation({
        location: "Johannesburg",
        showExactLocation: true,
        postIntent: "PROJECT_INSTALLATION",
        type: "POST",
      }),
      true
    );
    assert.equal(
      shouldShowPostLocation({
        location: "Johannesburg",
        showExactLocation: false,
        postIntent: "GENERAL",
        type: "POST",
      }),
      true
    );
  });
});
