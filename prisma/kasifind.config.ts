import "dotenv/config";
import { defineConfig } from "prisma/config";

const url = process.env.KASIFIND_DATABASE_URL?.trim();
if (!url && process.env.NODE_ENV === "production") {
  console.warn("[kasifind] KASIFIND_DATABASE_URL is not set — KasiFind DB commands will fail.");
}

export default defineConfig({
  schema: "kasifind/schema.prisma",
  migrations: {
    path: "kasifind/migrations",
  },
  datasource: {
    url: url ?? process.env.DATABASE_URL ?? "postgresql://localhost:5432/kasifind",
  },
});
