#!/usr/bin/env node
/**
 * Smoke test: homepage must not throw React minified error #418 after hydration.
 * Usage: node scripts/hydration-418-smoke.mjs [baseUrl]
 */
import { chromium } from "playwright-core";
import { existsSync } from "node:fs";

const baseUrl = (process.argv[2] ?? process.env.KF_SMOKE_BASE_URL ?? "http://127.0.0.1:3000").replace(
  /\/$/,
  ""
);
const chromePaths = [
  process.env.CHROME_PATH,
  "/usr/local/bin/google-chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

const executablePath = chromePaths.find((p) => existsSync(p));
if (!executablePath) {
  console.log("hydration-418-smoke: skip — no Chrome/Chromium binary found");
  process.exit(0);
}

const url = `${baseUrl}/`;
const errors = [];

const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

for (const { label, viewport, userAgent } of [
  { label: "mobile", viewport: { width: 390, height: 844 } },
  {
    label: "googlebot-mobile",
    viewport: { width: 412, height: 915 },
    userAgent:
      "Mozilla/5.0 (Linux; Android 6.0.1; Nexus 5X Build/MMB29P) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Mobile Safari/537.36 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
  },
  { label: "desktop", viewport: { width: 1280, height: 800 } },
]) {
  const context = await browser.newContext({ viewport, userAgent });
  const page = await context.newPage();
  page.on("pageerror", (err) => {
    if (String(err.message).includes("418")) errors.push({ label, message: err.message });
  });
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 120_000 });
    await page.waitForTimeout(1500);
  } finally {
    await context.close();
  }
}

await browser.close();

if (errors.length > 0) {
  console.error("hydration-418-smoke: FAIL", JSON.stringify(errors, null, 2));
  process.exit(1);
}

console.log("hydration-418-smoke: OK", url);