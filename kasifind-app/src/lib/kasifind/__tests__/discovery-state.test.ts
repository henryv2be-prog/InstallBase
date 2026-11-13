import assert from "node:assert/strict";
import test from "node:test";
import {
  isValidDiscoveryLocation,
  readDiscoveryState,
  readPersistedDiscoveryLocation,
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
  const session = new Map<string, string>();
  const local = new Map<string, string>();
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  const originalLocal = globalThis.localStorage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => {
        session.set(k, v);
      },
      removeItem: (k: string) => {
        session.delete(k);
      },
    },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => local.get(k) ?? null,
      setItem: (k: string, v: string) => {
        local.set(k, v);
      },
      removeItem: (k: string) => {
        local.delete(k);
      },
    },
  });
  try {
    writeDiscoveryState({
      query: "plumber",
      radiusKm: 10,
      radiusMode: "auto",
      categorySlug: null,
      location: { mode: "gps", lat: -25.7, lng: 28.2, label: "Near me" },
    });
    const read = readDiscoveryState();
    assert.equal(read?.radiusKm, 15);
    assert.equal(read?.radiusMode, "auto");
    assert.deepEqual(read?.location, {
      mode: "gps",
      lat: -25.7,
      lng: 28.2,
      label: "Near me",
    });
    assert.deepEqual(readPersistedDiscoveryLocation(), read?.location ?? null);
  } finally {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSession,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocal,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});

test("readDiscoveryState restores location from localStorage when session has no coords", () => {
  const session = new Map<string, string>();
  const local = new Map<string, string>();
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  const originalLocal = globalThis.localStorage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: globalThis,
  });
  Object.defineProperty(globalThis, "sessionStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => session.get(k) ?? null,
      setItem: (k: string, v: string) => {
        session.set(k, v);
      },
      removeItem: (k: string) => {
        session.delete(k);
      },
    },
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: {
      getItem: (k: string) => local.get(k) ?? null,
      setItem: (k: string, v: string) => {
        local.set(k, v);
      },
      removeItem: (k: string) => {
        local.delete(k);
      },
    },
  });
  try {
    local.set(
      "kf_discovery_location_v1",
      JSON.stringify({
        mode: "manual",
        lat: -26,
        lng: 28,
        label: "Roodepoort",
      })
    );
    session.set(
      "kf_discovery_state_v3",
      JSON.stringify({
        query: "",
        radiusKm: 5,
        radiusMode: "auto",
        categorySlug: null,
        location: null,
      })
    );
    const read = readDiscoveryState();
    assert.deepEqual(read?.location, {
      mode: "manual",
      lat: -26,
      lng: 28,
      label: "Roodepoort",
    });
  } finally {
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSession,
    });
    Object.defineProperty(globalThis, "localStorage", {
      configurable: true,
      value: originalLocal,
    });
    Object.defineProperty(globalThis, "window", {
      configurable: true,
      value: originalWindow,
    });
  }
});
