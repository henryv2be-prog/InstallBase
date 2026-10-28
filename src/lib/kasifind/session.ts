import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { getKasiFindPrisma } from "@/lib/kasifind/prisma";

const COOKIE_NAME = "kf_session";
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function secret(): string {
  const value = process.env.AUTH_SECRET?.trim() || process.env.KASIFIND_SESSION_SECRET?.trim();
  if (!value) throw new Error("AUTH_SECRET (or KASIFIND_SESSION_SECRET) is required for KasiFind sessions");
  return value;
}

function sign(userId: string, issuedAt: number): string {
  const payload = `${userId}.${issuedAt}`;
  const sig = createHmac("sha256", secret()).update(payload).digest("hex");
  return `${payload}.${sig}`;
}

function verify(token: string): { userId: string } | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [userId, issuedAtStr, sig] = parts;
  if (!userId || !issuedAtStr || !sig) return null;
  const issuedAt = Number.parseInt(issuedAtStr, 10);
  if (!Number.isFinite(issuedAt)) return null;
  if (Date.now() / 1000 - issuedAt > MAX_AGE_SEC) return null;

  const expected = sign(userId, issuedAt).split(".")[2]!;
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  return { userId };
}

export async function setKasiFindSession(userId: string) {
  const issuedAt = Math.floor(Date.now() / 1000);
  const value = sign(userId, issuedAt);
  const jar = await cookies();
  jar.set(COOKIE_NAME, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/kasifind",
    maxAge: MAX_AGE_SEC,
  });
}

export async function clearKasiFindSession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, "", { httpOnly: true, path: "/kasifind", maxAge: 0 });
}

export async function getKasiFindSessionUser() {
  const jar = await cookies();
  const token = jar.get(COOKIE_NAME)?.value;
  if (!token) return null;
  const parsed = verify(token);
  if (!parsed) return null;

  const kf = getKasiFindPrisma();
  const user = await kf.kfUser.findUnique({
    where: { id: parsed.userId },
    select: { id: true, email: true, name: true, role: true, suspended: true },
  });
  if (!user || user.suspended) return null;
  return user;
}

export async function requireKasiFindProvider() {
  const user = await getKasiFindSessionUser();
  if (!user) return { error: "Sign in required" as const };
  return { user };
}

export async function requireKasiFindAdmin() {
  const user = await getKasiFindSessionUser();
  if (!user || user.role !== "ADMIN") return { error: "Admin access required" as const };
  return { user };
}
