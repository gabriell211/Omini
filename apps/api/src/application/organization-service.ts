import { permissions, type Permission, type Vertical } from "@omni/contracts";
import type { Database } from "../infrastructure/database.js";

export interface CreateOrganizationInput {
  readonly legalName: string;
  readonly tradeName: string;
  readonly taxId: string;
  readonly verticals: readonly Vertical[];
  readonly ownerSubject: string;
  readonly provider: string;
  readonly correlationId: string;
}

export class OrganizationService {
  public constructor(private readonly database: Database) {}

  public async create(input: CreateOrganizationInput): Promise<{ organizationId: string; subscriptionStatus: "pending" }> {
    const organization = await this.database.client.$transaction(async (transaction) => {
      const created = await transaction.organization.create({
        data: {
          legalName: input.legalName,
          tradeName: input.tradeName,
          taxId: input.taxId
        }
      });

      await transaction.$executeRaw`SELECT set_config('app.current_organization_id', ${created.id}, true)`;
      await transaction.organizationVertical.createMany({
        data: input.verticals.map((vertical) => ({ organizationId: created.id, vertical }))
      });
      await transaction.membership.create({
        data: { organizationId: created.id, identitySubject: input.ownerSubject, role: "owner", permissions: [...permissions] as Permission[] }
      });
      await transaction.subscription.create({ data: { organizationId: created.id, provider: input.provider, status: "pending" } });
      await transaction.auditEvent.create({
        data: {
          organizationId: created.id,
          actorSubject: input.ownerSubject,
          correlationId: input.correlationId,
          action: "organization.created",
          aggregateType: "organization",
          aggregateId: created.id,
          afterData: { verticals: input.verticals }
        }
      });
      return created;
    });

    return { organizationId: organization.id, subscriptionStatus: "pending" };
  }

  public async getSubscriptionStatus(organizationId: string): Promise<"pending" | "active" | "past_due" | "cancelled"> {
    const subscription = await this.database.client.subscription.findUnique({
      where: { organizationId },
      select: { status: true }
    });
    if (!subscription || !isSubscriptionStatus(subscription.status)) return "pending";
    return subscription.status;
  }

  public async resolveMembership(organizationId: string, subject: string): Promise<readonly Permission[]> {
    const membership = await this.database.withTenant(organizationId, (transaction) => transaction.membership.findUnique({
      where: { organizationId_identitySubject: { organizationId, identitySubject: subject } }
    }));
    if (!membership || membership.revokedAt) throw new Error("FORBIDDEN_ORGANIZATION");
    return Array.isArray(membership.permissions)
      ? membership.permissions.filter((permission): permission is Permission => permissions.includes(permission as Permission))
      : [];
  }
}

function isSubscriptionStatus(value: string): value is "pending" | "active" | "past_due" | "cancelled" {
  return value === "pending" || value === "active" || value === "past_due" || value === "cancelled";
}
