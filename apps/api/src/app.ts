import helmet from "@fastify/helmet";
import Fastify, { type FastifyInstance, type FastifyRequest } from "fastify";
import { serializerCompiler, validatorCompiler, type ZodTypeProvider } from "fastify-type-provider-zod";
import { assertOrganizationAccess, assertPermission, assertSubscriptionActive, type RequestContext } from "@omni/contracts";
import { JwtAuthenticator } from "./auth.js";
import type { AppConfig } from "./config.js";

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

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(helmet, { contentSecurityPolicy: false });

  app.get("/health", async () => ({ status: "ok" }));

  app.addHook("onRequest", async (request, reply) => {
    if (request.routeOptions.url === "/health") return;

    try {
      const organizationId = getHeader(request, "x-organization-id");
      if (!organizationId) throw new Error("ORGANIZATION_REQUIRED");
      const actor = await authenticator.authenticate(getHeader(request, "authorization"));
      assertOrganizationAccess(actor, organizationId);
      request.context = {
        actor,
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
