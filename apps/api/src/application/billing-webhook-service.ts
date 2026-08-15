import { createHmac, timingSafeEqual } from "node:crypto";
import { z } from "zod";
import type { SubscriptionStatus } from "@omni/contracts";
import type { Database } from "../infrastructure/database.js";

const eventSchema = z.object({
  id: z.string().min(1).max(191),
  type: z.string().min(1).max(100),
  data: z.object({
    organization_id: z.uuid(),
    customer_id: z.string().max(191).optional(),
    subscription_id: z.string().max(191).optional(),
    current_period_end: z.iso.datetime().optional()
  })
});

type BillingEvent = z.infer<typeof eventSchema>;

export class BillingWebhookService {
  public constructor(
    private readonly database: Database,
    private readonly secret: string,
    private readonly provider = "generic"
  ) {}

  public verifySignature(rawBody: Buffer, providedSignature: string | undefined): void {
    const expected = createHmac("sha256", this.secret).update(rawBody).digest("hex");
    const received = providedSignature?.replace(/^sha256=/, "");
    if (!received || received.length !== expected.length) throw new Error("INVALID_WEBHOOK_SIGNATURE");
    if (!timingSafeEqual(Buffer.from(received, "hex"), Buffer.from(expected, "hex"))) {
      throw new Error("INVALID_WEBHOOK_SIGNATURE");
    }
  }

  public parse(body: unknown): BillingEvent {
    return eventSchema.parse(body);
  }

  public async process(event: BillingEvent): Promise<{ duplicate: boolean; subscriptionStatus: SubscriptionStatus }> {
    const status = statusForEvent(event.type);
    if (!status) throw new Error("UNSUPPORTED_BILLING_EVENT");

    return this.database.client.$transaction(async (transaction) => {
      const existing = await transaction.billingEvent.findUnique({ where: { providerEventId: event.id } });
      if (existing) return { duplicate: true, subscriptionStatus: toSubscriptionStatus(existing.eventType) ?? "pending" };

      await transaction.billingEvent.create({
        data: {
          organizationId: event.data.organization_id,
          provider: this.provider,
          providerEventId: event.id,
          eventType: event.type,
          payload: event
        }
      });
      await transaction.subscription.update({
        where: { organizationId: event.data.organization_id },
        data: {
          status,
          ...(event.data.customer_id ? { providerCustomerId: event.data.customer_id } : {}),
          ...(event.data.subscription_id ? { providerSubscriptionId: event.data.subscription_id } : {}),
          ...(event.data.current_period_end ? { currentPeriodEnd: new Date(event.data.current_period_end) } : {}),
          updatedAt: new Date()
        }
      });
      await transaction.billingEvent.update({ where: { providerEventId: event.id }, data: { processedAt: new Date() } });
      return { duplicate: false, subscriptionStatus: status };
    });
  }
}

function statusForEvent(eventType: string): SubscriptionStatus | undefined {
  if (eventType === "subscription.activated" || eventType === "payment.approved") return "active";
  if (eventType === "subscription.past_due" || eventType === "payment.failed") return "past_due";
  if (eventType === "subscription.cancelled") return "cancelled";
  return undefined;
}

function toSubscriptionStatus(eventType: string): SubscriptionStatus | undefined {
  return statusForEvent(eventType);
}
