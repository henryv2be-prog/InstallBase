import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeDefaultInPortfolio,
  formatWorkPostCount,
  getPostTradeGroupLabel,
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

  it("detects portfolio posts from inPortfolio flag", () => {
    assert.equal(isPortfolioPost({ inPortfolio: false }), false);
    assert.equal(isPortfolioPost({ inPortfolio: true }), true);
  });

  it("includes portfolio when intent or legacy project type matches", () => {
    assert.equal(shouldIncludeInPortfolio("PROJECT", "GENERAL"), true);
    assert.equal(shouldIncludeInPortfolio("POST", "PROJECT_INSTALLATION"), true);
    assert.equal(shouldIncludeInPortfolio("POST", "GENERAL"), false);
    assert.equal(computeDefaultInPortfolio("PROJECT", "GENERAL"), true);
    assert.equal(computeDefaultInPortfolio("POST", "GENERAL"), false);
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
    assert.equal(getPostTradeLabel({}), null);
    assert.equal(getPostTradeGroupLabel({}), "Uncategorised work");
  });

  it("formats work post counts", () => {
    assert.equal(formatWorkPostCount(1), "1 work post");
    assert.equal(formatWorkPostCount(8), "8 work posts");
  });

  it("hides exact work locations unless explicitly enabled", () => {
    assert.equal(
      shouldShowPostLocation({
        location: "123 Main Street",
        showExactLocation: false,
        postIntent: "PROJECT_INSTALLATION",
        type: "POST",
        inPortfolio: true,
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
