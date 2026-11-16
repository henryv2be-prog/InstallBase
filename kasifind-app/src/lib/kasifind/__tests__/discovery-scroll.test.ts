import assert from "node:assert/strict";
import test from "node:test";
import {
  applyDiscoveryScroll,
  clearDiscoveryScroll,
  consumeDiscoveryScroll,
  DISCOVERY_RESULTS_ANCHOR_ID,
  DISCOVERY_SEARCH_BAR_ID,
  measureDiscoveryResultsScrollY,
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

function installResultsScrollMocks(opts: {
  scrollY?: number;
  anchorTop?: number;
  listingTop?: number;
  searchBarHeight?: number;
}) {
  const scrollY = opts.scrollY ?? 120;
  const anchorTop = opts.anchorTop ?? 640;
  const listingTop = opts.listingTop ?? 520;
  const searchBarHeight = opts.searchBarHeight ?? 148;
  const scrollCalls: number[] = [];

  const listingEl = {
    getBoundingClientRect: () => ({ top: listingTop }),
  };
  const anchorEl = {
    getBoundingClientRect: () => ({ top: anchorTop }),
  };

  const originalWindow = globalThis.window;
  const originalDocument = globalThis.document;

  const searchBarEl = { offsetHeight: searchBarHeight };

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ...globalThis,
      scrollY,
      matchMedia: () => ({ matches: false }),
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
      visualViewport: { offsetTop: 0 },
    },
  });

  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: {
      querySelector: (sel: string) => {
        if (sel.includes("data-kf-listing-id")) return listingEl;
        if (sel.includes("kf-home-search-sticky")) return searchBarEl;
        return null;
      },
      getElementById: (id: string) => {
        if (id === DISCOVERY_RESULTS_ANCHOR_ID) return anchorEl;
        if (id === DISCOVERY_SEARCH_BAR_ID) return searchBarEl;
        return null;
      },
      documentElement: {
        style: {},
      },
    },
  });

  Object.defineProperty(globalThis, "getComputedStyle", {
    configurable: true,
    value: () => ({
      getPropertyValue: (name: string) => {
        if (name === "--kf-header-h") return "3.25";
        if (name === "font-size") return "16px";
        return "";
      },
      fontSize: "16px",
    }),
  });

  return {
    scrollCalls,
    restore() {
      Object.defineProperty(globalThis, "window", { configurable: true, value: originalWindow });
      Object.defineProperty(globalThis, "document", { configurable: true, value: originalDocument });
    },
  };
}

test("measureDiscoveryResultsScrollY prefers first listing card", () => {
  const mocks = installResultsScrollMocks({ scrollY: 100, listingTop: 520 });
  try {
    assert.equal(measureDiscoveryResultsScrollY(), 414);
  } finally {
    mocks.restore();
  }
});

test("scrollDiscoveryToTop scrolls to measured results Y", () => {
  const mocks = installResultsScrollMocks({ scrollY: 0, listingTop: 400 });
  try {
    scrollDiscoveryToTop();
    assert.deepEqual(mocks.scrollCalls, [194]);
  } finally {
    mocks.restore();
  }
});

test("scheduleScrollDiscoveryToTop scrolls to results on delayed attempts", () => {
  const mocks = installResultsScrollMocks({ scrollY: 0, listingTop: 400 });
  try {
    const cancel = scheduleScrollDiscoveryToTop();
    assert.equal(mocks.scrollCalls.length, 3);
    assert.ok(mocks.scrollCalls.every((y) => y === 194));
    cancel();
  } finally {
    mocks.restore();
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