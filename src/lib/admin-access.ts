import type { UserRole } from "@/generated/prisma/client";

function parseAdminEmails(): Set<string> {
  const raw = process.env.ADMIN_EMAILS ?? process.env.ADMIN_EMAIL ?? "";
  return new Set(
    raw
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  );
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return parseAdminEmails().has(email.trim().toLowerCase());
}

/** Admin access is controlled by ADMIN_EMAILS / ADMIN_EMAIL env vars. */
export function roleForEmail(email: string | null | undefined): UserRole {
  return isAdminEmail(email) ? "ADMIN" : "USER";
}
