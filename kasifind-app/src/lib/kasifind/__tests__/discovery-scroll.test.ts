import assert from "node:assert/strict";
import test from "node:test";
import {
  applyDiscoveryScroll,
  clearDiscoveryScroll,
  consumeDiscoveryScroll,
  readDiscoveryScroll,
  saveDiscoveryScroll,
  scheduleScrollDiscoveryToTop,
  scrollDiscoveryToTop,
} from "@/lib/kasifind/discovery-scroll";

test("saveDiscoveryScroll round-trips via consume", () => {
  const session = new Map<string, string>();
  const originalWindow = globalThis.window;
  const originalSession = globalThis.sessionStorage;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      scrollY: 420,
      scrollTo: () => undefined,
      requestAnimationFrame: (fn: FrameRequestCallback) => {
        fn(0);
        return 0;
      },
    },
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

  try {
    saveDiscoveryScroll("listing-1");
    assert.deepEqual(readDiscoveryScroll(), { listingId: "listing-1", y: 420 });
    const first = consumeDiscoveryScroll();
    assert.deepEqual(first, { listingId: "listing-1", y: 420 });
    assert.equal(readDiscoveryScroll(), null);
    clearDiscoveryScroll();
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    Object.defineProperty(globalThis, "sessionStorage", {
      configurable: true,
      value: originalSession,
    });
  }
});

test("scrollDiscoveryToTop scrolls to 0", () => {
  const scrollCalls: number[] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      scrollTo: (opts: { top: number }) => {
        scrollCalls.push(opts.top);
      },
      requestAnimationFrame: (fn: FrameRequestCallback) => {
        fn(0);
        return 0;
      },
    },
  });

  try {
    scrollDiscoveryToTop();
    assert.deepEqual(scrollCalls, [0, 0]);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

test("scheduleScrollDiscoveryToTop scrolls to 0 on delayed attempts", () => {
  const scrollCalls: number[] = [];
  const originalWindow = globalThis.window;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      scrollTo: (opts: { top: number }) => {
        scrollCalls.push(opts.top);
      },
      requestAnimationFrame: (fn: FrameRequestCallback) => {
        fn(0);
        return 0;
      },
      setTimeout: (fn: () => void, _ms?: number) => {
        fn();
        return 0;
      },
      clearTimeout: () => undefined,
      history: { scrollRestoration: "auto" },
    },
  });

  try {
    const cancel = scheduleScrollDiscoveryToTop();
    assert.ok(scrollCalls.length >= 2);
    assert.ok(scrollCalls.every((y) => y === 0));
    cancel();
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
  }
});

test("applyDiscoveryScroll scrolls to saved y", () => {
  let scrolledTo = -1;
  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;
  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      scrollTo: (opts: { top: number }) => {
        scrolledTo = opts.top;
      },
      requestAnimationFrame: (fn: FrameRequestCallback) => {
        fn(0);
        return 0;
      },
    },
  });
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: { querySelectorAll: () => [] },
  });

  try {
    applyDiscoveryScroll({ listingId: "x", y: 912 });
    assert.equal(scrolledTo, 912);
  } finally {
    Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
    Object.defineProperty(globalThis, "document", {
      configurable: true,
      value: originalDocument,
    });
  }
});