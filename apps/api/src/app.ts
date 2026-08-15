import helmet from "@fastify/helmet";
import rawBody from "fastify-raw-body";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { assertPermission, assertSubscriptionActive, verticals, type RequestContext } from "@omni/contracts";
import { z } from "zod";
import { JwtAuthenticator } from "./auth.js";
import { BillingWebhookService } from "./application/billing-webhook-service.js";
import { InfinitePayService } from "./application/infinitepay-service.js";
import { OrganizationService } from "./application/organization-service.js";
import { RestaurantService } from "./application/restaurant-service.js";
import { SupermarketService } from "./application/supermarket-service.js";
import type { AppConfig } from "./config.js";
import { Database } from "./infrastructure/database.js";

declare module "fastify" {
  interface FastifyRequest {
    context?: RequestContext;
  }
}

function getHeader(request: FastifyRequest, name: string): string | undefined {
  const value = request.headers[name];
  return typeof value === "string" ? value : undefined;
}

export async function buildApp(config: AppConfig): Promise<FastifyInstance> {
  const app = Fastify({ logger: { level: config.LOG_LEVEL } }).withTypeProvider<ZodTypeProvider>();
  const authenticator = new JwtAuthenticator(config);
  const database = new Database(config.DATABASE_URL);
  const organizations = new OrganizationService(database);
  const restaurant = new RestaurantService(database);
  const supermarket = new SupermarketService(database);
  const billing = new BillingWebhookService(database, config.BILLING_WEBHOOK_SECRET);
  const infinitePay = new InfinitePayService(database, {
    handle: config.INFINITEPAY_HANDLE,
    webhookUrl: config.INFINITEPAY_WEBHOOK_URL,
    redirectUrl: config.INFINITEPAY_REDIRECT_URL
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });
  await app.register(rawBody, { field: "rawBody", global: false, encoding: false, runFirst: true });
  app.addHook("onClose", async () => database.disconnect());

  app.get("/health", async () => ({ status: "ok" }));

  app.addHook("onRequest", async (request, reply) => {
    if (request.routeOptions.url === "/health" || request.routeOptions.url === "/v1/webhooks/billing" || request.routeOptions.url === "/v1/webhooks/infinitepay") return;

    try {
      const actor = await authenticator.authenticate(getHeader(request, "authorization"));
      if (request.routeOptions.url === "/v1/organizations") {
        request.context = { actor, organizationId: "", correlationId: getHeader(request, "x-correlation-id") ?? request.id };
        return;
      }
      const organizationId = getHeader(request, "x-organization-id");
      if (!organizationId) throw new Error("ORGANIZATION_REQUIRED");
      const memberPermissions = await organizations.resolveMembership(organizationId, actor.userId);
      const routePattern = request.routeOptions.url ?? "";
      const requestedVertical = routePattern.startsWith("/v1/restaurants/") ? "restaurant"
        : routePattern.startsWith("/v1/supermarkets/") ? "supermarket"
          : undefined;
      if (requestedVertical) await organizations.assertVerticalEnabled(organizationId, requestedVertical);
      request.context = {
        actor: {
          ...actor,
          organizationIds: [organizationId],
          permissions: memberPermissions,
          subscriptionStatus: await organizations.getSubscriptionStatus(organizationId)
        },
        organizationId,
        correlationId: getHeader(request, "x-correlation-id") ?? request.id
      };
    } catch (error) {
      const code = error instanceof Error ? error.message : "UNAUTHENTICATED";
      const statusCode = code.startsWith("FORBIDDEN") ? 403 : code === "ORGANIZATION_REQUIRED" ? 400 : 401;
      return reply.code(statusCode).send({ error: code, correlationId: request.id });
    }
  });

  app.get("/v1/session", async (request) => ({
    data: request.context
  }));

  app.post("/v1/organizations", async (request, reply) => {
    const body = z.object({
      legalName: z.string().trim().min(2).max(160),
      tradeName: z.string().trim().min(2).max(160),
      taxId: z.string().trim().min(11).max(18),
      verticals: z.array(z.enum(verticals)).min(1).max(12),
      billingProvider: z.string().trim().min(2).max(40).default("generic")
    }).safeParse(request.body);
    if (!body.success) return reply.code(400).send({ error: "INVALID_ORGANIZATION_INPUT", details: body.error.flatten() });
    try {
      const data = await organizations.create({
        ...body.data,
        ownerSubject: request.context!.actor.userId,
        correlationId: request.context!.correlationId,
        provider: body.data.billingProvider
      });
      return reply.code(201).send({ data });
    } catch (error) {
      const code = error instanceof Error ? error.message : "ORGANIZATION_CREATE_FAILED";
      return reply.code(code.includes("Unique") ? 409 : 500).send({ error: code });
    }
  });

  app.post("/v1/webhooks/billing", { config: { rawBody: true } }, async (request, reply) => {
    try {
      const raw = request.rawBody;
      if (!Buffer.isBuffer(raw)) throw new Error("WEBHOOK_BODY_REQUIRED");
      billing.verifySignature(raw, getHeader(request, config.BILLING_WEBHOOK_SIGNATURE_HEADER));
      const result = await billing.process(billing.parse(request.body));
      return reply.code(200).send({ received: true, ...result });
    } catch (error) {
      const code = error instanceof Error ? error.message : "WEBHOOK_PROCESSING_FAILED";
      const statusCode = code === "INVALID_WEBHOOK_SIGNATURE" ? 401 : code === "UNSUPPORTED_BILLING_EVENT" ? 422 : 400;
      return reply.code(statusCode).send({ error: code });
    }
  });

  app.post("/v1/webhooks/infinitepay", async (request, reply) => {
    try {
      const result = await infinitePay.confirmWebhook(infinitePay.parseWebhook(request.body));
      return reply.code(200).send({ received: true, ...result });
    } catch (error) {
      const code = error instanceof Error ? error.message : "INFINITEPAY_WEBHOOK_FAILED";
      const statusCode = code === "CHECKOUT_SESSION_NOT_FOUND" ? 404
        : code === "PAYMENT_AMOUNT_MISMATCH" || code === "PAYMENT_NOT_VERIFIED" ? 400
          : code === "INFINITEPAY_NOT_CONFIGURED" ? 503
            : 400;
      return reply.code(statusCode).send({ error: code });
    }
  });

  app.post("/v1/billing/infinitepay/checkout", async (request, reply) => {
    try {
      assertPermission(request.context!.actor, "billing.manage");
      const body = z.object({
        customer: z.object({
          name: z.string().trim().min(2).max(160).optional(),
          email: z.email().max(254).optional(),
          phoneNumber: z.string().trim().min(8).max(20).optional()
        }).optional()
      }).parse(request.body ?? {});
      const data = await infinitePay.createMonthlyCheckout(request.context!.organizationId, body.customer);
      return reply.code(201).send({ data });
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/restaurants/tables", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const body = z.object({ name: z.string().trim().min(1).max(80), capacity: z.number().int().min(1).max(100) }).parse(request.body);
      return reply.code(201).send({ data: await restaurant.createTable(request.context!.organizationId, body) });
    } catch (error) { return domainError(reply, error); }
  });

  app.get("/v1/restaurants/tables", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      return { data: await restaurant.listTables(request.context!.organizationId) };
    } catch (error) { return domainError(reply, error); }
  });

  app.patch("/v1/restaurants/tables/:tableId", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const params = z.object({ tableId: z.uuid() }).parse(request.params);
      const body = z.object({ name: z.string().trim().min(1).max(80).optional(), capacity: z.number().int().min(1).max(100).optional(), status: z.enum(["available", "reserved", "disabled"]).optional() }).refine((value) => Object.values(value).some((entry) => entry !== undefined), "UPDATE_REQUIRED").parse(request.body);
      return { data: await restaurant.updateTable(request.context!.organizationId, params.tableId, body) };
    } catch (error) { return domainError(reply, error); }
  });

  app.delete("/v1/restaurants/tables/:tableId", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const params = z.object({ tableId: z.uuid() }).parse(request.params);
      await restaurant.deleteTable(request.context!.organizationId, params.tableId);
      return reply.code(204).send();
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/restaurants/orders", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const body = z.object({
        tableId: z.uuid().optional(),
        items: z.array(z.object({ name: z.string().trim().min(1).max(160), quantity: z.number().int().min(1), unitCents: z.number().int().min(0) })).min(1)
      }).parse(request.body);
      return reply.code(201).send({ data: await restaurant.createOrder(request.context!.organizationId, body) });
    } catch (error) { return domainError(reply, error); }
  });

  app.get("/v1/restaurants/orders", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const query = z.object({ status: z.enum(["open", "sent", "preparing", "ready", "closed", "cancelled"]).optional() }).parse(request.query);
      return { data: await restaurant.listOrders(request.context!.organizationId, query.status) };
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/restaurants/orders/:orderId/items", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const params = z.object({ orderId: z.uuid() }).parse(request.params);
      const body = z.object({ name: z.string().trim().min(1).max(160), quantity: z.number().int().min(1), unitCents: z.number().int().min(0) }).parse(request.body);
      return reply.code(201).send({ data: await restaurant.addItem(request.context!.organizationId, params.orderId, body) });
    } catch (error) { return domainError(reply, error); }
  });

  app.patch("/v1/restaurants/orders/:orderId/status", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "restaurant.manage");
      const params = z.object({ orderId: z.uuid() }).parse(request.params);
      const body = z.object({ status: z.enum(["sent", "preparing", "ready", "closed", "cancelled"]) }).parse(request.body);
      return { data: await restaurant.transitionOrder(request.context!.organizationId, params.orderId, body.status) };
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/supermarkets/products", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const body = z.object({ sku: z.string().trim().min(1).max(80), barcode: z.string().trim().max(32).optional(), name: z.string().trim().min(1).max(160), unit: z.string().trim().min(1).max(8).default("UN"), salePriceCents: z.number().int().min(0) }).parse(request.body);
      return reply.code(201).send({ data: await supermarket.createProduct(request.context!.organizationId, body) });
    } catch (error) { return domainError(reply, error); }
  });

  app.get("/v1/supermarkets/products", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const query = z.object({ includeInactive: z.enum(["true", "false"]).optional() }).parse(request.query);
      return { data: await supermarket.listProducts(request.context!.organizationId, query.includeInactive === "true") };
    } catch (error) { return domainError(reply, error); }
  });

  app.patch("/v1/supermarkets/products/:productId", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const params = z.object({ productId: z.uuid() }).parse(request.params);
      const body = z.object({ sku: z.string().trim().min(1).max(80).optional(), barcode: z.string().trim().max(32).nullable().optional(), name: z.string().trim().min(1).max(160).optional(), unit: z.string().trim().min(1).max(8).optional(), salePriceCents: z.number().int().min(0).optional() }).refine((value) => Object.values(value).some((entry) => entry !== undefined), "UPDATE_REQUIRED").parse(request.body);
      return { data: await supermarket.updateProduct(request.context!.organizationId, params.productId, body) };
    } catch (error) { return domainError(reply, error); }
  });

  app.delete("/v1/supermarkets/products/:productId", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const params = z.object({ productId: z.uuid() }).parse(request.params);
      return { data: await supermarket.deactivateProduct(request.context!.organizationId, params.productId) };
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/supermarkets/products/:productId/inventory-adjustments", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const params = z.object({ productId: z.uuid() }).parse(request.params);
      const body = z.object({ delta: z.number().int().min(-1_000_000).max(1_000_000).refine((value) => value !== 0) }).parse(request.body);
      return { data: await supermarket.adjustInventory(request.context!.organizationId, params.productId, body.delta) };
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/supermarkets/sales", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const body = z.object({ items: z.array(z.object({ productId: z.uuid(), quantity: z.number().int().min(1) })).min(1) }).parse(request.body);
      return reply.code(201).send({ data: await supermarket.confirmSale(request.context!.organizationId, body) });
    } catch (error) { return domainError(reply, error); }
  });

  app.get("/v1/supermarkets/sales", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      return { data: await supermarket.listSales(request.context!.organizationId) };
    } catch (error) { return domainError(reply, error); }
  });

  app.post("/v1/supermarkets/sales/:saleId/cancel", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "supermarket.manage");
      const params = z.object({ saleId: z.uuid() }).parse(request.params);
      return { data: await supermarket.cancelSale(request.context!.organizationId, params.saleId) };
    } catch (error) { return domainError(reply, error); }
  });

  app.get("/v1/financial/summary", async (request, reply) => {
    try {
      assertSubscriptionActive(request.context!.actor);
      assertPermission(request.context!.actor, "financial.read");
      return {
        data: {
          organizationId: request.context!.organizationId,
          message: "Financial read model will be supplied by the financial module."
        }
      };
    } catch (error) {
      const errorCode = error instanceof Error ? error.message : "FORBIDDEN";
      return reply.code(errorCode === "PAYMENT_REQUIRED" ? 402 : 403).send({ error: errorCode });
    }
  });

  return app;
}

function domainError(reply: { code: (statusCode: number) => { send: (body: object) => unknown } }, error: unknown) {
  const code = error instanceof Error ? error.message : "DOMAIN_OPERATION_FAILED";
  const statusCode = code === "PAYMENT_REQUIRED" ? 402
    : code.startsWith("FORBIDDEN") ? 403
      : code.includes("NOT_FOUND") ? 404
        : code === "INSUFFICIENT_STOCK" || code === "TABLE_NOT_AVAILABLE" || code === "TABLE_IN_USE" || code === "INVALID_ORDER_TRANSITION" || code === "ORDER_NOT_EDITABLE" || code === "SALE_NOT_CANCELLABLE" ? 409
          : code.startsWith("INVALID_") || code.includes("REQUIRED") || code === "TOTAL_TOO_LARGE" ? 400
            : 500;
  return reply.code(statusCode).send({ error: code });
}
