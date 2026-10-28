import "server-only";
import { PrismaClient } from "@/generated/kasifind-prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForKf = globalThis as unknown as {
  kfPrisma: PrismaClient | undefined;
  kfPool: Pool | undefined;
};

export function isKasiFindDbConfigured(): boolean {
  return Boolean(process.env.KASIFIND_DATABASE_URL?.trim());
}

function createKasiFindPrismaClient() {
  const connectionString = process.env.KASIFIND_DATABASE_URL?.trim();
  if (!connectionString) {
    throw new Error("KASIFIND_DATABASE_URL is not configured");
  }

  const pool =
    globalForKf.kfPool ??
    new Pool({
      connectionString,
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

/** Separate PostgreSQL database — never touches InstallBase `DATABASE_URL` tables. */
export function getKasiFindPrisma(): PrismaClient {
  if (!globalForKf.kfPrisma) {
    globalForKf.kfPrisma = createKasiFindPrismaClient();
  }
  return globalForKf.kfPrisma;
}
