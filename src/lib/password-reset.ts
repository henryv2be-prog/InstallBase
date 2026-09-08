import "server-only";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { buildPasswordResetUrl, passwordResetEmailContent, sendEmail } from "@/lib/email";

const RESET_TTL_MS = 60 * 60 * 1000;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function createResetToken() {
  return randomBytes(32).toString("hex");
}

/** Always returns the same success message to avoid leaking whether an email exists. */
export async function requestPasswordReset(email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { error: "Please enter your email address" };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalized },
    select: { id: true, email: true, passwordHash: true, suspended: true },
  });

  if (user?.passwordHash && !user.suspended) {
    const rawToken = createResetToken();
    const tokenHash = hashToken(rawToken);
    const expiresAt = new Date(Date.now() + RESET_TTL_MS);

    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    const resetUrl = buildPasswordResetUrl(rawToken);
    const { subject, text, html } = passwordResetEmailContent(resetUrl);
    const sent = await sendEmail({ to: user.email, subject, text, html });

    if (!sent.ok && process.env.NODE_ENV === "production") {
      console.error("[password-reset] email delivery failed for", normalized);
    }
  }

  return {
    success: true,
    message: "If an account exists with that email, we sent a reset link.",
  };
}

export async function resetPasswordWithToken(token: string, password: string) {
  const trimmedToken = token.trim();
  if (!trimmedToken) return { error: "Reset link is invalid or expired" };
  if (password.length < 8) return { error: "Password must be at least 8 characters" };

  const tokenHash = hashToken(trimmedToken);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: { select: { id: true, suspended: true, passwordHash: true } } },
  });

  if (!record || record.expiresAt < new Date() || record.user.suspended || !record.user.passwordHash) {
    return { error: "Reset link is invalid or expired" };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { id: record.id } }),
    prisma.passwordResetToken.deleteMany({ where: { userId: record.userId } }),
  ]);

  return { success: true };
}
