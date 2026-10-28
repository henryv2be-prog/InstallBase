import "dotenv/config";
import { defineConfig } from "prisma/config";

function databaseUrl(): string {
  return (
    process.env.KASIFIND_DATABASE_URL?.trim() ||
    process.env.DATABASE_URL?.trim() ||
    "postgresql://localhost:5432/kasifind"
  );
}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: databaseUrl(),
  },
});
