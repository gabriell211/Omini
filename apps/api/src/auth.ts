import { createRemoteJWKSet, jwtVerify } from "jose";
import type { Permission, AuthenticatedActor, SubscriptionStatus } from "@omni/contracts";
import type { AppConfig } from "./config.js";

type JwtClaims = {
  readonly organization_ids?: unknown;
  readonly permissions?: unknown;
  readonly subscription_status?: unknown;
};

function stringArray(value: unknown): string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? value
    : [];
}

function subscriptionStatus(value: unknown): SubscriptionStatus {
  return value === "active" || value === "past_due" || value === "cancelled" || value === "pending"
    ? value
    : "pending";
}

export class JwtAuthenticator {
  private readonly jwks?: ReturnType<typeof createRemoteJWKSet>;

  public constructor(private readonly config: AppConfig) {
    if (config.JWT_JWKS_URL) this.jwks = createRemoteJWKSet(new URL(config.JWT_JWKS_URL));
  }

  public get isConfigured(): boolean {
    return Boolean(this.jwks && this.config.JWT_ISSUER && this.config.JWT_AUDIENCE);
  }

  public async authenticate(authorization?: string): Promise<AuthenticatedActor> {
    if (!this.isConfigured || !this.jwks || !this.config.JWT_ISSUER || !this.config.JWT_AUDIENCE) {
      throw new Error("AUTH_CONFIGURATION_REQUIRED");
    }
    if (!authorization?.startsWith("Bearer ")) {
      throw new Error("UNAUTHENTICATED");
    }

    const token = authorization.slice("Bearer ".length);
    const result = await jwtVerify(token, this.jwks, {
      issuer: this.config.JWT_ISSUER,
      audience: this.config.JWT_AUDIENCE
    });
    const claims = result.payload as JwtClaims;

    if (!result.payload.sub) {
      throw new Error("UNAUTHENTICATED");
    }

    return {
      userId: result.payload.sub,
      organizationIds: stringArray(claims.organization_ids),
      permissions: stringArray(claims.permissions) as Permission[],
      subscriptionStatus: subscriptionStatus(claims.subscription_status)
    };
  }
}
