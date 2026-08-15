import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  // `generate` runs in CI without a live database. Runtime validation still
  // requires DATABASE_URL through AppConfig before the API can start.
  datasource: {
    url:
      process.env.OMNI_NEON_DATABASE_URL ??
      process.env.DATABASE_URL ??
      "postgresql://placeholder:placeholder@localhost:5432/placeholder"
  }
});
