import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidDiscoveryLocation,
  readDiscoveryState,
  writeDiscoveryState,
} from "@/lib/kasifind/discovery-state";

test("isValidDiscoveryLocation accepts gps and manual coords", () => {
  assert.equal(
    isValidDiscoveryLocation({
      mode: "gps",
      lat: -26.1,
      lng: 28.05,
      label: "Near you",
    }),
    true
  );
  assert.equal(isValidDiscoveryLocation({ mode: "gps", lat: NaN, lng: 1, label: "x" }), false);
});

test("writeDiscoveryState round-trips location in sessionStorage", () => {
  const storage = new Map<string, string>();
  const originalWindow = globalThis.window;
  const original = globalThis.sessionStorage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => storage.get(k) ?? null,
      setItem: (k: string, v: string) => {
        storage.set(k, v);
      },
      removeItem: (k: string) => {
        storage.delete(k);
      },
    },
  });
  try {
    writeDiscoveryState({
      query: "plumber",
      radiusKm: 10,
      categorySlug: null,
      location: { mode: "gps", lat: -25.7, lng: 28.2, label: "Near you" },
    });
    const read = readDiscoveryState();
    assert.deepEqual(read?.location, {
      mode: "gps",
      lat: -25.7,
      lng: 28.2,
      label: "Near you",
    });
  } finally {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: original,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});
