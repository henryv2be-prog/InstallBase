#!/usr/bin/env node
/**
 * Run the daily re-engagement job locally or from a scheduler.
 *
 * Usage:
 *   CRON_SECRET=your-secret node scripts/run-daily-reengagement.mjs
 *   CRON_SECRET=your-secret node scripts/run-daily-reengagement.mjs --dry-run
 *   CRON_SECRET=your-secret node scripts/run-daily-reengagement.mjs --force
 *
 * Env:
 *   APP_URL — base URL (default http://localhost:3000)
 *   CRON_SECRET — must match server CRON_SECRET
 */

const baseUrl = (process.env.APP_URL || process.env.AUTH_URL || "http://localhost:3000").replace(/\/$/, "");
const secret = process.env.CRON_SECRET;

if (!secret) {
  console.error("CRON_SECRET is required");
  process.exit(1);
}

const args = new URLSearchParams();
if (process.argv.includes("--dry-run")) args.set("dryRun", "1");
if (process.argv.includes("--force")) args.set("force", "1");

const userIdArg = process.argv.find((arg) => arg.startsWith("--user="));
if (userIdArg) args.set("userId", userIdArg.split("=")[1]);

const url = `${baseUrl}/api/cron/daily-reengagement?${args.toString()}`;

const response = await fetch(url, {
  method: "POST",
  headers: {
    Authorization: `Bearer ${secret}`,
  },
});

const body = await response.text();
console.log(response.status, body);

if (!response.ok) {
  process.exit(1);
}
