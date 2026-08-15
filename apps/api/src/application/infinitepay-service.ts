import { randomUUID } from "node:crypto";
import { z } from "zod";
import type { Prisma } from "../generated/prisma/client.js";
import type { Database } from "../infrastructure/database.js";

const infinitePayWebhookSchema = z.object({
  invoice_slug: z.string().min(1).max(191),
  amount: z.number().int().positive(),
  paid_amount: z.number().int().positive(),
  installments: z.number().int().positive(),
  capture_method: z.enum(["credit_card", "pix"]),
  transaction_nsu: z.string().min(1).max(191),
  order_nsu: z.string().min(1).max(191),
  receipt_url: z.url(),
  items: z.array(z.unknown()).min(1)
});

type InfinitePayWebhook = z.infer<typeof infinitePayWebhookSchema>;

export interface InfinitePayConfig {
  readonly handle?: string | undefined;
  readonly webhookUrl?: string | undefined;
  readonly redirectUrl?: string | undefined;
}

export class InfinitePayService {
  private static readonly baseUrl = "https://api.checkout.infinitepay.io";
  private static readonly monthlyAmountCents = 4_990;

  public constructor(private readonly database: Database, private readonly config: InfinitePayConfig) {}

  public async createMonthlyCheckout(
    organizationId: string,
    customer?: { readonly name?: string | undefined; readonly email?: string | undefined; readonly phoneNumber?: string | undefined }
  ): Promise<{ sessionId: string; checkoutUrl: string }> {
    const handle = this.requireHandle();
    const session = await this.database.withTenant(organizationId, (transaction) => transaction.checkoutSession.create({
      data: {
        organizationId,
        provider: "infinitepay",
        orderNsu: `omni_${randomUUID()}`,
        amountCents: InfinitePayService.monthlyAmountCents
      }
    }));

    try {
      const response = await this.request("/links", {
        handle,
        items: [{ quantity: 1, price: InfinitePayService.monthlyAmountCents, description: "Omni Business Platform — assinatura mensal" }],
        order_nsu: session.orderNsu,
        ...(this.config.webhookUrl ? { webhook_url: this.config.webhookUrl } : {}),
        ...(this.config.redirectUrl ? { redirect_url: this.config.redirectUrl } : {}),
        ...(hasCustomerData(customer) ? { customer: {
          ...(customer?.name ? { name: customer.name } : {}),
          ...(customer?.email ? { email: customer.email } : {}),
          ...(customer?.phoneNumber ? { phone_number: customer.phoneNumber } : {})
        } } : {})
      });
      const checkoutUrl = checkoutUrlFrom(response);
      const invoiceSlug = stringField(response, "slug") ?? stringField(response, "invoice_slug");
      await this.database.withTenant(organizationId, (transaction) => transaction.checkoutSession.update({
        where: { id: session.id },
        data: {
          checkoutUrl,
          providerPayload: toPrismaJson(response),
          ...(invoiceSlug ? { providerInvoiceSlug: invoiceSlug } : {})
        }
      }));
      return { sessionId: session.id, checkoutUrl };
    } catch (error) {
      await this.database.withTenant(organizationId, (transaction) => transaction.checkoutSession.update({
        where: { id: session.id },
        data: { status: "failed" }
      }));
      throw error;
    }
  }

  public parseWebhook(body: unknown): InfinitePayWebhook {
    return infinitePayWebhookSchema.parse(body);
  }

  public async confirmWebhook(body: InfinitePayWebhook): Promise<{ duplicate: boolean; organizationId: string }> {
    const handle = this.requireHandle();
    const session = await this.database.client.checkoutSession.findUnique({ where: { orderNsu: body.order_nsu } });
    if (!session || session.provider !== "infinitepay") throw new Error("CHECKOUT_SESSION_NOT_FOUND");
    if (session.status === "paid") return { duplicate: true, organizationId: session.organizationId };
    if (session.amountCents !== body.amount) throw new Error("PAYMENT_AMOUNT_MISMATCH");

    const verification = await this.request("/payment_check", {
      handle,
      order_nsu: body.order_nsu,
      transaction_nsu: body.transaction_nsu,
      slug: body.invoice_slug
    });
    if (verification.paid !== true || verification.amount !== session.amountCents) {
      throw new Error("PAYMENT_NOT_VERIFIED");
    }

    return this.database.client.$transaction(async (transaction) => {
      const alreadyProcessed = await transaction.billingEvent.findUnique({ where: { providerEventId: `infinitepay:${body.transaction_nsu}` } });
      if (alreadyProcessed) return { duplicate: true, organizationId: session.organizationId };
      await transaction.billingEvent.create({
        data: {
          organizationId: session.organizationId,
          provider: "infinitepay",
          providerEventId: `infinitepay:${body.transaction_nsu}`,
          eventType: "payment.approved",
          payload: toPrismaJson(body),
          processedAt: new Date()
        }
      });
      await transaction.checkoutSession.update({
        where: { id: session.id },
        data: {
          status: "paid",
          providerInvoiceSlug: body.invoice_slug,
          providerTransactionNsu: body.transaction_nsu,
          paidAt: new Date()
        }
      });
      await transaction.subscription.update({
        where: { organizationId: session.organizationId },
        data: { status: "active", provider: "infinitepay", updatedAt: new Date() }
      });
      return { duplicate: false, organizationId: session.organizationId };
    });
  }

  private requireHandle(): string {
    if (!this.config.handle) throw new Error("INFINITEPAY_NOT_CONFIGURED");
    return this.config.handle;
  }

  private async request(path: string, payload: Record<string, unknown>): Promise<Record<string, unknown>> {
    const response = await fetch(`${InfinitePayService.baseUrl}${path}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8_000)
    });
    const body: unknown = await response.json().catch(() => ({}));
    if (!response.ok || !isRecord(body)) throw new Error("INFINITEPAY_REQUEST_FAILED");
    return body;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(record: Record<string, unknown>, key: string): string | undefined {
  const value = record[key];
  return typeof value === "string" ? value : undefined;
}

function checkoutUrlFrom(response: Record<string, unknown>): string {
  const candidate = stringField(response, "url") ?? stringField(response, "checkout_url") ?? stringField(response, "link");
  if (!candidate || !z.url().safeParse(candidate).success) throw new Error("INFINITEPAY_INVALID_CHECKOUT_RESPONSE");
  return candidate;
}

function hasCustomerData(customer: { readonly name?: string | undefined; readonly email?: string | undefined; readonly phoneNumber?: string | undefined } | undefined): boolean {
  return Boolean(customer?.name || customer?.email || customer?.phoneNumber);
}

function toPrismaJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
