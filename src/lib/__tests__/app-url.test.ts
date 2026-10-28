import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getAppUrl } from "@/lib/app-url";

describe("getAppUrl", () => {
  it("uses origin only when AUTH_URL includes a path", () => {
    const prevAuth = process.env.AUTH_URL;
    const prevRailway = process.env.RAILWAY_PUBLIC_DOMAIN;
    process.env.AUTH_URL = "https://installbase.io/feed";
    delete process.env.RAILWAY_PUBLIC_DOMAIN;
    try {
      assert.equal(getAppUrl(), "https://installbase.io");
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
      if (prevRailway === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
      else process.env.RAILWAY_PUBLIC_DOMAIN = prevRailway;
    }
  });

  it("adds https when AUTH_URL is a bare hostname", () => {
    const prevAuth = process.env.AUTH_URL;
    const prevNext = process.env.NEXTAUTH_URL;
    const prevRailway = process.env.RAILWAY_PUBLIC_DOMAIN;
    process.env.AUTH_URL = "my-app.up.railway.app";
    delete process.env.NEXTAUTH_URL;
    delete process.env.RAILWAY_PUBLIC_DOMAIN;
    try {
      assert.equal(getAppUrl(), "https://my-app.up.railway.app");
    } finally {
      if (prevAuth === undefined) delete process.env.AUTH_URL;
      else process.env.AUTH_URL = prevAuth;
      if (prevNext === undefined) delete process.env.NEXTAUTH_URL;
      else process.env.NEXTAUTH_URL = prevNext;
      if (prevRailway === undefined) delete process.env.RAILWAY_PUBLIC_DOMAIN;
      else process.env.RAILWAY_PUBLIC_DOMAIN = prevRailway;
    }
  });
});
