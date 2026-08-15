import { describe, expect, it } from "vitest";
import { assertOrganizationAccess, assertPermission, assertSubscriptionActive, type AuthenticatedActor } from "@omni/contracts";

const actor: AuthenticatedActor = {
  userId: "user-1",
  organizationIds: ["org-a"],
  permissions: ["financial.read"],
  subscriptionStatus: "active"
};

describe("tenant authorization", () => {
  it("denies an organization outside the actor membership", () => {
    expect(() => assertOrganizationAccess(actor, "org-b")).toThrow("FORBIDDEN_ORGANIZATION");
  });

  it("denies absent permissions", () => {
    expect(() => assertPermission(actor, "billing.manage")).toThrow("FORBIDDEN_PERMISSION");
  });

  it("denies protected data when the subscription is not active", () => {
    expect(() => assertSubscriptionActive({ ...actor, subscriptionStatus: "pending" })).toThrow("PAYMENT_REQUIRED");
  });
});
