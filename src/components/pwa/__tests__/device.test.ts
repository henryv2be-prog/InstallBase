import { afterEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isHuaweiDevice,
  isWrongDomain,
  likelyLacksGooglePlayServices,
  prefersManualHomeScreenInstall,
} from "../device";

const ORIGINAL_NAVIGATOR = globalThis.navigator;

afterEach(() => {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: ORIGINAL_NAVIGATOR,
  });
});

function mockNavigator(userAgent: string) {
  Object.defineProperty(globalThis, "navigator", {
    configurable: true,
    value: { userAgent },
  });
}

describe("device helpers", () => {
  it("detects Huawei user agents", () => {
    mockNavigator("Mozilla/5.0 (Linux; Android 12; MGA-LX3) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36");
    assert.equal(isHuaweiDevice(), true);
    assert.equal(prefersManualHomeScreenInstall(), true);
  });

  it("flags Huawei devices without GMS", () => {
    mockNavigator("Mozilla/5.0 (Linux; Android 12; MGA-LX3) AppleWebKit/537.36 Chrome/120.0.0.0 Mobile Safari/537.36");
    assert.equal(likelyLacksGooglePlayServices(), true);
  });

  it("detects wrong domain", () => {
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: { location: { hostname: "base.up.railway.app" } },
    });
    assert.equal(isWrongDomain("installbase.up.railway.app"), true);
    assert.equal(isWrongDomain("base.up.railway.app"), false);
  });
});
