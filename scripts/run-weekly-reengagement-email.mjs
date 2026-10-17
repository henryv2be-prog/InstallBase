#!/usr/bin/env node
/**
 * Trigger the weekly re-engagement email job (Resend).
 *
 *   CRON_SECRET=your-secret node scripts/run-weekly-reengagement-email.mjs
 *   CRON_SECRET=your-secret node scripts/run-weekly-reengagement-email.mjs --dry-run
 *   CRON_SECRET=your-secret node scripts/run-weekly-reengagement-email.mjs --force
 */

const baseUrl = (process.env.AUTH_URL || process.env.NEXTAUTH_URL || "http://localhost:3000").replace(
  /\/$/,
  ""
);

const args = new URLSearchParams();
for (const arg of process.argv.slice(2)) {
  if (arg === "--dry-run") args.set("dryRun", "1");
  if (arg === "--force") args.set("force", "1");
}

const secret = process.env.CRON_SECRET?.trim();
if (!secret) {
  console.error("Set CRON_SECRET to call the cron route.");
  process.exit(1);
}

const url = `${baseUrl}/api/cron/weekly-reengagement-email?${args.toString()}`;

const response = await fetch(url, {
  method: "POST",
  headers: { Authorization: `Bearer ${secret}` },
});

const body = await response.text();
console.log(response.status, body);

if (!response.ok) process.exit(1);
