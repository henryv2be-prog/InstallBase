import "server-only";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForKf = globalThis as unknown as {
  kfPrisma: PrismaClient | undefined;
  kfPool: Pool | undefined;
};

export function isKasiFindDbConfigured(): boolean {
  return Boolean(
    process.env.KASIFIND_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim()
  );
}

function connectionString(): string {
  const url =
    process.env.KASIFIND_DATABASE_URL?.trim() || process.env.DATABASE_URL?.trim();
  if (!url) throw new Error("KASIFIND_DATABASE_URL or DATABASE_URL is not configured");
  return url;
}

function createKasiFindPrismaClient() {
  const cs = connectionString();

  const pool =
    globalForKf.kfPool ??
    new Pool({
      connectionString: cs,
      max: 6,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 8_000,
    });
  globalForKf.kfPool = pool;

  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

/** KasiFind PostgreSQL — standalone app database only. */
export function getKasiFindPrisma(): PrismaClient {
  if (!globalForKf.kfPrisma) {
    globalForKf.kfPrisma = createKasiFindPrismaClient();
  }
  return globalForKf.kfPrisma;
}
