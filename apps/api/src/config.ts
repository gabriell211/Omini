import { z } from "zod";

const environment = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  JWT_ISSUER: z.url(),
  JWT_AUDIENCE: z.string().min(1),
  JWT_JWKS_URL: z.url()
});

export type AppConfig = z.infer<typeof environment>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  return environment.parse(source);
}
