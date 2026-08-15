import type { IncomingMessage, ServerResponse } from "node:http";
import type { FastifyInstance } from "fastify";

let application: Promise<FastifyInstance> | undefined;

async function getApplication(): Promise<FastifyInstance> {
  if (!application) {
    application = (async () => {
      const [{ buildApp }, { loadConfig }] = await Promise.all([
        import("../src/app.js"),
        import("../src/config.js")
      ]);
      const app = await buildApp(loadConfig());
      await app.ready();
      return app;
    })();
  }

  try {
    return await application;
  } catch (error) {
    // Do not cache a transient database/network initialization failure.
    application = undefined;
    throw error;
  }
}

/**
 * Vercel's Node runtime already provides the native request/response pair
 * expected by Fastify. Reusing a ready Fastify instance avoids opening a TCP
 * listener per invocation and keeps route, security and validation behavior
 * identical to local and container deployments.
 */
export default async function handler(request: IncomingMessage, response: ServerResponse): Promise<void> {
  try {
    const app = await getApplication();
    app.server.emit("request", request, response);
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown startup error";
    console.error({ err: reason }, "API startup failed");
    if (!response.headersSent) {
      response.writeHead(500, { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" });
      response.end(JSON.stringify({ error: "SERVICE_UNAVAILABLE" }));
    }
  }
}
