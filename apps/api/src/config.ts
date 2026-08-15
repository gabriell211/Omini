import { z } from "zod";

const environment = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3000),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]).default("info"),
  DATABASE_URL: z.url(),
  // Authentication remains closed until a real OIDC issuer is configured.
  // Making it optional here lets health checks and signed payment webhooks
  // operate without ever falling back to an insecure development identity.
  JWT_ISSUER: z.url().optional(),
  JWT_AUDIENCE: z.string().min(1).optional(),
  JWT_JWKS_URL: z.url().optional(),
  BILLING_WEBHOOK_SECRET: z.string().min(32),
  BILLING_WEBHOOK_SIGNATURE_HEADER: z.string().min(1).default("x-omni-signature"),
  INFINITEPAY_HANDLE: z.string().trim().min(2).optional(),
  INFINITEPAY_WEBHOOK_URL: z.url().optional(),
  INFINITEPAY_REDIRECT_URL: z.url().optional()
});

export type AppConfig = z.infer<typeof environment>;

export function loadConfig(source: NodeJS.ProcessEnv = process.env): AppConfig {
  return environment.parse({
    ...source,
    // The Neon Vercel integration uses a prefix so it can coexist with a
    // previous DATABASE_URL during the infrastructure transition.
    DATABASE_URL: source.OMNI_NEON_DATABASE_URL ?? source.DATABASE_URL
  });
}
