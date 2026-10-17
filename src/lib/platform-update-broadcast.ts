import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import {
  buildPlatformUpdateEmailPayload,
  validatePlatformUpdateInput,
  type PlatformUpdateEmailContent,
} from "@/lib/platform-update-email";

export type PlatformUpdateBroadcastResult = {
  dryRun: boolean;
  eligibleUsers: number;
  sent: number;
  failed: number;
  broadcastId?: string;
  skipped?: string;
};

function isResendConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

function delayMs(): number {
  const raw = process.env.PLATFORM_UPDATE_EMAIL_DELAY_MS?.trim();
  const parsed = raw ? Number.parseInt(raw, 10) : 200;
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 200;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function countRecipients(): Promise<number> {
  return prisma.user.count({ where: { suspended: false } });
}

async function writeAudit(input: {
  sentByUserId: string;
  content: PlatformUpdateEmailContent;
  sentCount: number;
  failedCount: number;
  dryRun: boolean;
}) {
  return prisma.platformUpdateBroadcast.create({
    data: {
      sentByUserId: input.sentByUserId,
      subject: input.content.subject,
      headline: input.content.headline,
      bodyText: input.content.bodyText,
      ctaLabel: input.content.ctaLabel,
      ctaUrl: input.content.ctaUrl,
      sentCount: input.sentCount,
      failedCount: input.failedCount,
      dryRun: input.dryRun,
    },
  });
}

export async function sendPlatformUpdateTestEmail(input: {
  adminUserId: string;
  subject: string;
  headline: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
}): Promise<{ success: true; to: string } | { error: string }> {
  if (!isResendConfigured()) {
    return { error: "Email is not configured. Add RESEND_API_KEY and EMAIL_FROM on the server." };
  }

  const validated = validatePlatformUpdateInput(input);
  if (validated.ok === false) return { error: validated.error };

  const admin = await prisma.user.findUnique({
    where: { id: input.adminUserId },
    select: { email: true, name: true, role: true, suspended: true },
  });
  if (!admin || admin.suspended || admin.role !== "ADMIN") {
    return { error: "Admin account not found." };
  }

  const payload = buildPlatformUpdateEmailPayload(validated.content, admin.name);
  const sent = await sendEmail({
    to: admin.email,
    subject: `[Preview] ${payload.subject}`,
    html: payload.html,
    text: payload.text,
  });

  if (sent.ok === false) return { error: sent.error };
  return { success: true, to: admin.email };
}

export async function runPlatformUpdateBroadcast(input: {
  sentByUserId: string;
  subject: string;
  headline: string;
  bodyText: string;
  ctaLabel: string;
  ctaUrl: string;
  dryRun?: boolean;
}): Promise<PlatformUpdateBroadcastResult> {
  const dryRun = input.dryRun ?? false;
  const validated = validatePlatformUpdateInput(input);
  if (validated.ok === false) {
    return { dryRun, eligibleUsers: 0, sent: 0, failed: 0, skipped: validated.error };
  }

  const eligibleUsers = await countRecipients();
  if (eligibleUsers === 0) {
    return { dryRun, eligibleUsers: 0, sent: 0, failed: 0, skipped: "no_recipients" };
  }

  if (dryRun) {
    const audit = await writeAudit({
      sentByUserId: input.sentByUserId,
      content: validated.content,
      sentCount: eligibleUsers,
      failedCount: 0,
      dryRun: true,
    });
    return {
      dryRun: true,
      eligibleUsers,
      sent: eligibleUsers,
      failed: 0,
      broadcastId: audit.id,
    };
  }

  if (!isResendConfigured()) {
    return {
      dryRun: false,
      eligibleUsers,
      sent: 0,
      failed: 0,
      skipped: "email_not_configured",
    };
  }

  const users = await prisma.user.findMany({
    where: { suspended: false },
    select: { id: true, email: true, name: true },
    orderBy: { createdAt: "asc" },
  });

  let sent = 0;
  let failed = 0;
  const pause = delayMs();

  for (const user of users) {
    const payload = buildPlatformUpdateEmailPayload(validated.content, user.name);
    const result = await sendEmail({
      to: user.email,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }).catch(() => ({ ok: false as const, error: "send_failed" }));

    if (result.ok) sent += 1;
    else failed += 1;

    if (pause > 0) await sleep(pause);
  }

  const audit = await writeAudit({
    sentByUserId: input.sentByUserId,
    content: validated.content,
    sentCount: sent,
    failedCount: failed,
    dryRun: false,
  });

  console.info(
    `[platform-update] Broadcast ${audit.id}: sent=${sent} failed=${failed} eligible=${eligibleUsers}`
  );

  return {
    dryRun: false,
    eligibleUsers,
    sent,
    failed,
    broadcastId: audit.id,
  };
}
