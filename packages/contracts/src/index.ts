export const verticals = [
  "restaurant",
  "supermarket",
  "pharmacy",
  "legal",
  "beauty_wellness",
  "field_services",
  "retail_commerce",
  "franchise_hq",
  "veterinary",
  "auto_repair",
  "building_supply",
  "vehicle_dealership"
] as const;

export type Vertical = (typeof verticals)[number];

export const permissions = [
  "organization.read",
  "organization.manage",
  "billing.read",
  "billing.manage",
  "financial.read",
  "financial.manage",
  "reports.read",
  "restaurant.manage",
  "supermarket.manage",
  "pharmacy.manage",
  "legal.manage",
  "beauty_wellness.manage",
  "field_services.manage",
  "retail_commerce.manage",
  "franchise_hq.manage",
  "veterinary.manage",
  "auto_repair.manage",
  "building_supply.manage",
  "vehicle_dealership.manage"
] as const;

export type Permission = (typeof permissions)[number];

export const subscriptionStatuses = ["pending", "active", "past_due", "cancelled"] as const;
export type SubscriptionStatus = (typeof subscriptionStatuses)[number];

export interface AuthenticatedActor {
  readonly userId: string;
  readonly organizationIds: readonly string[];
  readonly permissions: readonly Permission[];
  readonly subscriptionStatus: SubscriptionStatus;
}

export interface RequestContext {
  readonly correlationId: string;
  readonly actor: AuthenticatedActor;
  readonly organizationId: string;
}

export function assertOrganizationAccess(
  actor: AuthenticatedActor,
  organizationId: string
): void {
  if (!actor.organizationIds.includes(organizationId)) {
    throw new Error("FORBIDDEN_ORGANIZATION");
  }
}

export function assertPermission(actor: AuthenticatedActor, permission: Permission): void {
  if (!actor.permissions.includes(permission)) {
    throw new Error("FORBIDDEN_PERMISSION");
  }
}

export function assertSubscriptionActive(actor: AuthenticatedActor): void {
  if (actor.subscriptionStatus !== "active") {
    throw new Error("PAYMENT_REQUIRED");
  }
}
